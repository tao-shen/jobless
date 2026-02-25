#!/usr/bin/env python3
"""Compute stricter (conservative) task exposure.

Strict design:
1) Only O*NET Core tasks are included.
2) Task automatability requires BOTH:
   - high similarity to tool capability text (top-1 similarity above high percentile),
   - corroboration from multiple tools (top-2/top-3 support).
3) No wage weighting; employment-only aggregation (same as prior requirement).
"""

from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

import compute_task_exposure_paper_method as base


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output"
REPORT_PATH = ROOT / "task_exposure_report_strict.md"


def map_tools_to_tasks_strict(task_df: pd.DataFrame, tools_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, float]]:
    tool_texts = tools_df["tool_text"].fillna("").astype(str).tolist()
    task_texts = task_df["task_text_clean"].fillna("").astype(str).tolist()

    vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=2, max_features=200000)
    vec.fit(tool_texts + task_texts)
    x_tools = vec.transform(tool_texts)
    x_tasks = vec.transform(task_texts)

    n = x_tasks.shape[0]
    s1 = np.zeros(n, dtype=np.float32)
    s2 = np.zeros(n, dtype=np.float32)
    s3 = np.zeros(n, dtype=np.float32)
    top_idx = np.zeros((n, 3), dtype=np.int32)

    batch = 400
    k = 3
    for start in range(0, n, batch):
        end = min(start + batch, n)
        sims = linear_kernel(x_tasks[start:end], x_tools)
        idx_part = np.argpartition(sims, -k, axis=1)[:, -k:]
        vals_part = np.take_along_axis(sims, idx_part, axis=1)
        order = np.argsort(vals_part, axis=1)[:, ::-1]
        idx = np.take_along_axis(idx_part, order, axis=1)
        vals = np.take_along_axis(vals_part, order, axis=1)

        s1[start:end] = vals[:, 0].astype(np.float32)
        s2[start:end] = vals[:, 1].astype(np.float32)
        s3[start:end] = vals[:, 2].astype(np.float32)
        top_idx[start:end] = idx.astype(np.int32)

        if start % 4000 == 0:
            print(f"[strict mapping] processed tasks {start}/{n}")

    p80 = float(np.nanpercentile(s1, 80))
    p95 = float(np.nanpercentile(s1, 95))
    denom = max(p95 - p80, 1e-6)

    # High-confidence similarity component (strict threshold).
    sim_component = np.clip((s1 - p80) / denom, 0.0, 1.0)

    # Multi-tool corroboration component.
    safe_s1 = np.where(s1 > 1e-9, s1, np.nan)
    corroboration = np.nanmean(np.stack([s2 / safe_s1, s3 / safe_s1], axis=1), axis=1)
    corroboration = np.nan_to_num(corroboration, nan=0.0, posinf=0.0, neginf=0.0)
    corroboration = np.clip(corroboration, 0.0, 1.0)

    # Source diversity of top-3 tools adds confidence (1/3 to 1.0).
    sources = tools_df["source"].astype(str).to_numpy()
    src_top = sources[top_idx]
    diversity = np.array([len(set(row.tolist())) / 3.0 for row in src_top], dtype=np.float32)

    # Strict task automatability score. No floor, unlike baseline.
    strict_auto = sim_component * (0.7 * corroboration + 0.3 * diversity)
    strict_auto = np.clip(strict_auto, 0.0, 1.0)

    out = task_df.copy()
    out["tool_similarity_top1"] = s1
    out["tool_similarity_top2"] = s2
    out["tool_similarity_top3"] = s3
    out["task_auto_score"] = strict_auto
    out["top_tool_name"] = tools_df.iloc[top_idx[:, 0]]["tool_name"].values
    out["top_tool_source"] = tools_df.iloc[top_idx[:, 0]]["source"].values

    meta = {
        "top1_p80": p80,
        "top1_p95": p95,
        "top1_mean": float(np.mean(s1)),
        "strict_auto_mean": float(np.mean(strict_auto)),
    }
    return out, meta


def build_report(
    meta: Dict[str, float],
    occ: pd.DataFrame,
    sector_ts: pd.DataFrame,
    sector_growth: pd.DataFrame,
    national_ts: pd.DataFrame,
    core_task_count: int,
    all_task_count: int,
) -> str:
    y0, y1 = base.YEARS[0], base.YEARS[-1]
    start_val = float(national_ts.loc[national_ts["year"] == y0, "national_exposure"].iloc[0])
    end_val = float(national_ts.loc[national_ts["year"] == y1, "national_exposure"].iloc[0])
    nat_cagr = base.cagr(start_val, end_val, y1 - y0)

    top_occ = occ.sort_values("occupation_exposure", ascending=False).head(20)
    top_sector = sector_ts[sector_ts["year"] == y1].sort_values("industry_exposure", ascending=False).head(20)
    fast_sector = sector_growth.sort_values(f"industry_exposure_cagr_{y0}_{y1}", ascending=False).head(15)

    lines: List[str] = []
    lines.append("# 严格暴露度（保守口径）")
    lines.append("")
    lines.append(f"- 生成时间（UTC）: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"- 口径区间: {y0}-{y1}")
    lines.append("- 数据源: O*NET + BLS OEWS + 工具语料（Zapier/OpenTools/MCP）")
    lines.append("- 约束: 不使用工资，仅任务与就业")
    lines.append("")
    lines.append("## 严格规则")
    lines.append("")
    lines.append("1. 仅纳入 O*NET `Core` 任务。")
    lines.append("2. 任务暴露度必须同时满足：")
    lines.append("   - 高相似度：top1 相似度进入高分位区间（P80以上）；")
    lines.append("   - 多工具支持：top2/top3 相似度与 top1 一致；")
    lines.append("   - 多来源支持：top3 工具来源越多越高。")
    lines.append("3. 严格暴露度无最小保底分（不再设 0.02 下限）。")
    lines.append("")
    lines.append("## 严格映射诊断")
    lines.append("")
    lines.append(f"- 任务数量: Core {core_task_count:,} / 全部 {all_task_count:,}")
    lines.append(f"- top1 相似度阈值: P80={meta['top1_p80']:.4f}, P95={meta['top1_p95']:.4f}")
    lines.append(f"- top1 相似度均值: {meta['top1_mean']:.4f}")
    lines.append(f"- 严格任务暴露度均值: {meta['strict_auto_mean']:.4f}")
    lines.append("")
    lines.append("## 全国暴露度")
    lines.append("")
    lines.append(f"- {y0}: {start_val:.4f}")
    lines.append(f"- {y1}: {end_val:.4f}")
    lines.append(f"- CAGR({y0}-{y1}): {base.format_pct(nat_cagr)}")
    lines.append("")
    lines.append(f"## 暴露度最高职业（Top 20，{y1}）")
    lines.append("")
    lines.append("| SOC | 职业 | 严格暴露度 |")
    lines.append("|---|---|---:|")
    for _, r in top_occ.iterrows():
        lines.append(f"| {r['soc_code']} | {r['occupation_title']} | {r['occupation_exposure']:.4f} |")
    lines.append("")
    lines.append(f"## 暴露度最高行业大类（{y1}）")
    lines.append("")
    lines.append("| 行业大类 | 严格暴露度 |")
    lines.append("|---|---:|")
    for _, r in top_sector.iterrows():
        lines.append(f"| {r['sector_title']} ({r['sector_code']}) | {r['industry_exposure']:.4f} |")
    lines.append("")
    lines.append(f"## 行业暴露度增速（大类，{y0}-{y1}）")
    lines.append("")
    lines.append("| 行业大类 | 暴露度CAGR | 暴露度同比(2023-2024) |")
    lines.append("|---|---:|---:|")
    for _, r in fast_sector.iterrows():
        lines.append(
            f"| {r['sector_title']} ({r['sector_code']}) | "
            f"{base.format_pct(r[f'industry_exposure_cagr_{y0}_{y1}'])} | "
            f"{base.format_pct(r[f'industry_exposure_yoy_{base.YEARS[-2]}_{y1}'])} |"
        )
    lines.append("")
    lines.append("## 输出文件")
    lines.append("")
    lines.append("- `output/strict_task_tool_mapping.csv`")
    lines.append("- `output/occupation_task_exposure_strict.csv`")
    lines.append("- `output/industry_exposure_by_year_naics4_strict.csv`")
    lines.append("- `output/industry_exposure_growth_naics4_strict.csv`")
    lines.append("- `output/industry_exposure_by_year_sector_strict.csv`")
    lines.append("- `output/industry_exposure_growth_sector_strict.csv`")
    lines.append("- `output/national_exposure_strict.json`")
    return "\n".join(lines)


def main() -> None:
    base.ensure_dirs()

    print("[1/6] Load tool corpus...")
    tool_path = OUT_DIR / "tool_corpus_all.csv"
    if tool_path.exists():
        tools = pd.read_csv(tool_path)
    else:
        tools = base.build_tool_corpus(force_refresh=False)
        tools.to_csv(tool_path, index=False)

    print("[2/6] Load O*NET tasks...")
    task_df, occ_title = base.read_onet_task_data()
    all_task_count = int(len(task_df))
    task_df = task_df[task_df["task_type"].astype(str).str.lower() == "core"].copy()
    core_task_count = int(len(task_df))

    print("[3/6] Strict task-tool mapping...")
    task_auto, meta = map_tools_to_tasks_strict(task_df, tools)
    task_auto[
        [
            "soc_code",
            "task_id",
            "task_text",
            "task_auto_score",
            "tool_similarity_top1",
            "tool_similarity_top2",
            "tool_similarity_top3",
            "top_tool_name",
            "top_tool_source",
        ]
    ].to_csv(OUT_DIR / "strict_task_tool_mapping.csv", index=False)

    print("[4/6] Occupation exposure...")
    occ_exposure = base.build_occupation_exposure(task_auto, occ_title).sort_values("occupation_exposure", ascending=False)
    occ_exposure.to_csv(OUT_DIR / "occupation_task_exposure_strict.csv", index=False)

    print("[5/6] Industry time series...")
    industry_year = []
    occ_year = []
    for y in base.YEARS:
        industry_year.append(base.read_year_industry_exposure(y, occ_exposure))
        occ_year.append(base.read_year_national_occupation(y, occ_exposure))
    industry_ts = pd.concat(industry_year, ignore_index=True)
    occ_ts = pd.concat(occ_year, ignore_index=True)
    sector_ts = (
        industry_ts.groupby(["year", "sector_code", "sector_title"], as_index=False)
        .agg(total_emp=("total_emp", "sum"), exposed_emp=("exposed_emp", "sum"), matched_emp=("matched_emp", "sum"))
        .assign(industry_exposure=lambda x: x["exposed_emp"] / x["total_emp"], match_rate=lambda x: x["matched_emp"] / x["total_emp"])
    )
    industry_growth = base.add_growth(industry_ts, ["naics", "naics_title", "sector_code", "sector_title"], "industry_exposure", base.YEARS)
    sector_growth = base.add_growth(sector_ts, ["sector_code", "sector_title"], "industry_exposure", base.YEARS)

    industry_ts.to_csv(OUT_DIR / "industry_exposure_by_year_naics4_strict.csv", index=False)
    industry_growth.to_csv(OUT_DIR / "industry_exposure_growth_naics4_strict.csv", index=False)
    sector_ts.to_csv(OUT_DIR / "industry_exposure_by_year_sector_strict.csv", index=False)
    sector_growth.to_csv(OUT_DIR / "industry_exposure_growth_sector_strict.csv", index=False)

    national = occ_ts.groupby("year", as_index=False).agg(total_emp=("tot_emp", "sum"), exposed_emp=("exposed_emp", "sum"))
    national["national_exposure"] = national["exposed_emp"] / national["total_emp"]
    with open(OUT_DIR / "national_exposure_strict.json", "w", encoding="utf-8") as f:
        json.dump(
            [
                {
                    "year": int(r.year),
                    "national_exposure": float(r.national_exposure),
                    "total_emp": float(r.total_emp),
                    "exposed_emp": float(r.exposed_emp),
                }
                for r in national.itertuples(index=False)
            ],
            f,
            ensure_ascii=False,
            indent=2,
        )

    print("[6/6] Write strict report...")
    report = build_report(meta, occ_exposure, sector_ts, sector_growth, national, core_task_count, all_task_count)
    REPORT_PATH.write_text(report, encoding="utf-8")

    print(f"Done. Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
