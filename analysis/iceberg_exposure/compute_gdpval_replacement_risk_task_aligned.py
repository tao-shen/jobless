#!/usr/bin/env python3
"""Task-aligned GDPval replacement risk (win-only, no calibration).

Pipeline:
1) Build O*NET task-level auto scores with paper-method tooling.
2) Align each GDPval gold task prompt to O*NET tasks within mapped occupation SOC(s).
3) Convert prompt-level aligned exposure to occupation-level aligned exposure.
4) Replace baseline exposure for mapped occupations, keep baseline for others.
5) Estimate occupation win probabilities (direct for mapped GDPval occupations;
   semantic transfer + shrinkage for others), then compute industry/national risk.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

import compute_gdpval_replacement_risk_rigorous as rig
import compute_task_exposure_paper_method as base


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output"
REPORT_PATH = ROOT / "gdpval_replacement_risk_task_aligned_report.md"
GDPVAL_GOLD_PATH = ROOT / "data" / "raw" / "gdpval_hf" / "train-00000-of-00001.parquet"
TASK_AUTO_CACHE = OUT_DIR / "onet_task_auto_full.csv"

ALIGN_TOPK = 5
SIM_K_NEIGHBORS = 5
MANUAL_OCC_SPLIT: Dict[str, List[str]] = {
    # GDPval appendix A.7 notes this SOC-4 occupation should include these SOC-6 children.
    "Buyers and Purchasing Agents": ["13-1021", "13-1022", "13-1023"],
}


@dataclass
class TaskAlignmentOutputs:
    task_alignment: pd.DataFrame
    occ_aligned_exposure: pd.DataFrame
    soc_aligned_exposure: pd.DataFrame
    mapping_detail: pd.DataFrame


def clean_text(s: str) -> str:
    x = str(s).lower()
    x = re.sub(r"[^a-z0-9\s]", " ", x)
    x = re.sub(r"\s+", " ", x).strip()
    return x


def load_task_auto_scores(force_refresh: bool = False) -> pd.DataFrame:
    if TASK_AUTO_CACHE.exists() and not force_refresh:
        df = pd.read_csv(TASK_AUTO_CACHE, dtype={"soc_code": str, "task_id": str})
        return df

    tools_path = OUT_DIR / "tool_corpus_all.csv"
    if tools_path.exists():
        tools = pd.read_csv(tools_path)
    else:
        tools = base.build_tool_corpus(force_refresh=False)

    task_df, _ = base.read_onet_task_data()
    task_auto = base.map_tools_to_tasks(task_df, tools)
    keep_cols = [
        "soc_code",
        "onet_soc_code",
        "task_id",
        "task_text",
        "task_text_clean",
        "task_type",
        "task_weight",
        "task_auto_score",
        "tool_similarity",
        "top_tool_name",
        "top_tool_source",
    ]
    task_auto = task_auto[keep_cols].copy()
    task_auto.to_csv(TASK_AUTO_CACHE, index=False)
    return task_auto


def build_occ_to_socs(occ_exposure: pd.DataFrame, gdp_tasks: pd.DataFrame) -> Tuple[Dict[str, List[str]], pd.DataFrame]:
    name_map = rig.build_name_mapping(
        gdp_tasks["occupation"].dropna().astype(str).unique().tolist(),
        occ_exposure[["soc_code", "occupation_title"]],
    )
    map_rows: List[Dict] = []
    occ_to_socs: Dict[str, List[str]] = {}

    for occ_name in sorted(gdp_tasks["occupation"].dropna().astype(str).unique().tolist()):
        if occ_name in MANUAL_OCC_SPLIT:
            socs = [s for s in MANUAL_OCC_SPLIT[occ_name] if s in set(occ_exposure["soc_code"].astype(str))]
            occ_to_socs[occ_name] = sorted(set(socs))
            for soc in occ_to_socs[occ_name]:
                title = occ_exposure.loc[occ_exposure["soc_code"] == soc, "occupation_title"].iloc[0]
                map_rows.append(
                    {
                        "gdpval_occupation": occ_name,
                        "soc_code": soc,
                        "occupation_title": title,
                        "mapping_method": "manual_split_from_paper_appendix",
                        "name_similarity": 1.0,
                    }
                )
            continue

        row = name_map[name_map["gdpval_occupation"] == occ_name]
        if row.empty or row["soc_code"].isna().all():
            occ_to_socs[occ_name] = []
            map_rows.append(
                {
                    "gdpval_occupation": occ_name,
                    "soc_code": None,
                    "occupation_title": None,
                    "mapping_method": "unmatched",
                    "name_similarity": 0.0,
                }
            )
        else:
            soc = str(row.iloc[0]["soc_code"])
            occ_to_socs[occ_name] = [soc]
            map_rows.append(
                {
                    "gdpval_occupation": occ_name,
                    "soc_code": soc,
                    "occupation_title": row.iloc[0]["occupation_title"],
                    "mapping_method": str(row.iloc[0]["match_method"]),
                    "name_similarity": float(row.iloc[0]["name_similarity"]),
                }
            )
    mapping_detail = pd.DataFrame(map_rows)
    return occ_to_socs, mapping_detail


def align_gdpval_tasks_to_onet(
    gdp_tasks: pd.DataFrame,
    task_auto: pd.DataFrame,
    occ_to_socs: Dict[str, List[str]],
) -> pd.DataFrame:
    gdp = gdp_tasks.copy()
    gdp["prompt_clean"] = gdp["prompt"].fillna("").map(clean_text)

    rows: List[Dict] = []
    for occ_name, grp in gdp.groupby("occupation", sort=True):
        socs = occ_to_socs.get(occ_name, [])
        if not socs:
            for _, r in grp.iterrows():
                rows.append(
                    {
                        "task_id": r["task_id"],
                        "sector": r["sector"],
                        "occupation": occ_name,
                        "mapped_socs": "",
                        "alignment_topk": 0,
                        "top_onet_soc_code": None,
                        "top_onet_task_id": None,
                        "top_onet_task_text": None,
                        "top_similarity": 0.0,
                        "aligned_task_exposure": np.nan,
                    }
                )
            continue

        cand = task_auto[task_auto["soc_code"].isin(socs)].copy()
        if cand.empty:
            for _, r in grp.iterrows():
                rows.append(
                    {
                        "task_id": r["task_id"],
                        "sector": r["sector"],
                        "occupation": occ_name,
                        "mapped_socs": "|".join(socs),
                        "alignment_topk": 0,
                        "top_onet_soc_code": None,
                        "top_onet_task_id": None,
                        "top_onet_task_text": None,
                        "top_similarity": 0.0,
                        "aligned_task_exposure": np.nan,
                    }
                )
            continue

        cand = cand.reset_index(drop=True)
        vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1, max_features=200000)
        # Fit on O*NET task space only; prompts are projected into this fixed task space.
        vec.fit(cand["task_text_clean"].tolist())
        x_task = vec.transform(cand["task_text_clean"].tolist())
        x_prompt = vec.transform(grp["prompt_clean"].tolist())
        sims = linear_kernel(x_prompt, x_task)

        k_eff = min(ALIGN_TOPK, len(cand))
        top_idx = np.argpartition(sims, -k_eff, axis=1)[:, -k_eff:]
        top_val = np.take_along_axis(sims, top_idx, axis=1)
        order = np.argsort(top_val, axis=1)[:, ::-1]
        top_idx = np.take_along_axis(top_idx, order, axis=1)
        top_val = np.take_along_axis(top_val, order, axis=1)

        for i, (_, r) in enumerate(grp.iterrows()):
            idxs = top_idx[i]
            vals = np.clip(top_val[i], 0.0, None)
            pri = cand.iloc[idxs]["task_weight"].fillna(0.01).to_numpy(dtype=float)
            raw = vals * np.clip(pri, 1e-9, None)
            if not np.isfinite(raw.sum()) or raw.sum() <= 0:
                raw = np.clip(pri, 1e-9, None)
            if raw.sum() <= 0:
                raw = np.ones_like(raw)
            w = raw / raw.sum()

            task_scores = cand.iloc[idxs]["task_auto_score"].fillna(0.0).to_numpy(dtype=float)
            aligned_e = float(np.sum(w * task_scores))

            best = idxs[0]
            best_row = cand.iloc[best]
            rows.append(
                {
                    "task_id": r["task_id"],
                    "sector": r["sector"],
                    "occupation": occ_name,
                    "mapped_socs": "|".join(socs),
                    "alignment_topk": int(k_eff),
                    "top_onet_soc_code": best_row["soc_code"],
                    "top_onet_task_id": best_row["task_id"],
                    "top_onet_task_text": best_row["task_text"],
                    "top_similarity": float(vals[0]),
                    "aligned_task_exposure": aligned_e,
                }
            )

    return pd.DataFrame(rows)


def build_task_alignment_outputs(
    gdp_tasks: pd.DataFrame,
    task_auto: pd.DataFrame,
    occ_exposure: pd.DataFrame,
) -> TaskAlignmentOutputs:
    occ_to_socs, mapping_detail = build_occ_to_socs(occ_exposure, gdp_tasks)
    task_alignment = align_gdpval_tasks_to_onet(gdp_tasks, task_auto, occ_to_socs)

    occ_aligned = (
        task_alignment.groupby("occupation", as_index=False)
        .agg(
            aligned_task_count=("aligned_task_exposure", lambda s: int(s.notna().sum())),
            aligned_task_exposure_mean=("aligned_task_exposure", "mean"),
            aligned_task_exposure_std=("aligned_task_exposure", "std"),
            top_similarity_mean=("top_similarity", "mean"),
            top_similarity_p10=("top_similarity", lambda s: float(np.nanquantile(s, 0.10))),
            top_similarity_p90=("top_similarity", lambda s: float(np.nanquantile(s, 0.90))),
        )
    )
    occ_aligned["aligned_task_exposure_std"] = occ_aligned["aligned_task_exposure_std"].fillna(0.0)

    # Expand to SOC-level aligned exposure; if one occupation maps to multiple SOCs, copy value.
    occ_to_socs, _ = build_occ_to_socs(occ_exposure, gdp_tasks)
    soc_rows: List[Dict] = []
    for _, r in occ_aligned.iterrows():
        occ_name = r["occupation"]
        socs = occ_to_socs.get(occ_name, [])
        for soc in socs:
            soc_rows.append(
                {
                    "soc_code": soc,
                    "gdpval_occupation": occ_name,
                    "aligned_occupation_exposure": r["aligned_task_exposure_mean"],
                    "aligned_task_count": int(r["aligned_task_count"]),
                    "top_similarity_mean": float(r["top_similarity_mean"]),
                }
            )
    soc_aligned = pd.DataFrame(soc_rows)

    # Resolve accidental duplicates by averaging.
    if not soc_aligned.empty:
        soc_aligned = (
            soc_aligned.groupby("soc_code", as_index=False)
            .agg(
                gdpval_occupation=("gdpval_occupation", lambda s: "|".join(sorted(set(s)))),
                aligned_occupation_exposure=("aligned_occupation_exposure", "mean"),
                aligned_task_count=("aligned_task_count", "sum"),
                top_similarity_mean=("top_similarity_mean", "mean"),
            )
        )

    return TaskAlignmentOutputs(
        task_alignment=task_alignment,
        occ_aligned_exposure=occ_aligned,
        soc_aligned_exposure=soc_aligned,
        mapping_detail=mapping_detail,
    )


def build_occ_win_table_with_split(
    parsed: rig.ParsedGDPval,
    mapping_detail: pd.DataFrame,
) -> pd.DataFrame:
    mapped = mapping_detail[mapping_detail["soc_code"].notna()][["gdpval_occupation", "soc_code"]].copy()
    rows: List[Dict] = []
    for _, r in parsed.by_occ.iterrows():
        occ = str(r["gdpval_occupation"])
        m = mapped[mapped["gdpval_occupation"] == occ]
        if m.empty:
            continue
        for _, mr in m.iterrows():
            rows.append(
                {
                    "model": r["model"],
                    "gdpval_occupation": occ,
                    "soc_code": str(mr["soc_code"]),
                    "win_rate": float(r["win_rate"]),
                    "win_or_tie_rate": float(r["win_or_tie_rate"]),
                }
            )
    if not rows:
        return pd.DataFrame(columns=["model", "gdpval_occupation", "soc_code", "win_rate", "win_or_tie_rate"])
    out = pd.DataFrame(rows).drop_duplicates(["model", "soc_code"]).reset_index(drop=True)
    return out


def compute_risk_with_task_aligned_exposure(
    occ_exposure_base: pd.DataFrame,
    soc_aligned_exposure: pd.DataFrame,
    mapping_detail: pd.DataFrame,
    parsed: rig.ParsedGDPval,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict]:
    # Build adjusted exposure vector for all SOC occupations:
    # replace baseline exposure with task-aligned exposure where available.
    occ_exp = occ_exposure_base[["soc_code", "occupation_title", "occupation_exposure"]].copy()
    occ_exp = occ_exp.rename(columns={"occupation_exposure": "occupation_exposure_base"})
    occ_exp = occ_exp.merge(soc_aligned_exposure[["soc_code", "aligned_occupation_exposure"]], on="soc_code", how="left")
    occ_exp["occupation_exposure"] = occ_exp["aligned_occupation_exposure"].where(
        occ_exp["aligned_occupation_exposure"].notna(), occ_exp["occupation_exposure_base"]
    )

    # Capability probabilities at occupation level.
    occ_win = build_occ_win_table_with_split(parsed, mapping_detail)
    anchor_soc = sorted(occ_win["soc_code"].dropna().astype(str).unique().tolist())

    corpus = rig.build_occupation_corpus(occ_exposure_base[["soc_code", "occupation_title", "occupation_exposure"]])
    W, alpha, transfer_meta = rig.build_similarity_transfer_matrix(corpus, anchor_soc, k=SIM_K_NEIGHBORS)
    soc_to_idx = {s: i for i, s in enumerate(corpus["soc_code"].tolist())}

    ind24 = rig.read_industry_detail_2024()
    occ_probs_rows: List[pd.DataFrame] = []
    overall_rows: List[Dict] = []

    for model in parsed.totals["model"].tolist():
        global_p = float(parsed.totals.loc[parsed.totals["model"] == model, "win_rate"].iloc[0])
        d_m = occ_win[occ_win["model"] == model].copy()
        p_anchor_map = dict(zip(d_m["soc_code"].astype(str), d_m["win_rate"].astype(float)))
        p_anchor = np.array([p_anchor_map.get(s, global_p) for s in anchor_soc], dtype=float)

        p_knn = W @ p_anchor
        p_all = alpha * p_knn + (1.0 - alpha) * global_p
        for s, p in p_anchor_map.items():
            if s in soc_to_idx:
                p_all[soc_to_idx[s]] = p
        p_all = np.clip(p_all, 0.0, 1.0)

        occ_model = occ_exp.copy()
        occ_model["model"] = model
        occ_model["model_global_win_rate"] = global_p
        occ_model["ai_win_probability_occ"] = [float(p_all[soc_to_idx[s]]) for s in occ_model["soc_code"]]
        occ_model["replacement_risk_occ"] = occ_model["occupation_exposure"] * occ_model["ai_win_probability_occ"]
        occ_model["transfer_alpha"] = [float(alpha[soc_to_idx[s]]) for s in occ_model["soc_code"]]
        occ_model["is_anchor_direct"] = occ_model["soc_code"].isin(p_anchor_map).astype(int)
        occ_probs_rows.append(occ_model)

        d_ind = ind24.merge(
            occ_model[["soc_code", "occupation_exposure", "ai_win_probability_occ"]],
            left_on="occ_code",
            right_on="soc_code",
            how="left",
        )
        d_ind["occupation_exposure"] = d_ind["occupation_exposure"].fillna(0.0)
        d_ind["ai_win_probability_occ"] = d_ind["ai_win_probability_occ"].fillna(global_p)
        d_ind["risk_prob_occ"] = d_ind["occupation_exposure"] * d_ind["ai_win_probability_occ"]
        d_ind["expected_affected_emp"] = d_ind["risk_prob_occ"] * d_ind["tot_emp"]
        d_ind["exposure_emp"] = d_ind["occupation_exposure"] * d_ind["tot_emp"]

        total_emp = float(d_ind["tot_emp"].sum())
        national_exposure = float(d_ind["exposure_emp"].sum() / max(total_emp, 1e-9))
        national_risk = float(d_ind["expected_affected_emp"].sum() / max(total_emp, 1e-9))
        overall_rows.append(
            {
                "model": model,
                "model_global_win_rate": global_p,
                "national_total_employment": total_emp,
                "national_exposure_emp_weighted": national_exposure,
                "national_replacement_risk_emp_weighted": national_risk,
            }
        )

    occ_probs = pd.concat(occ_probs_rows, ignore_index=True)
    overall = pd.DataFrame(overall_rows).sort_values("national_replacement_risk_emp_weighted", ascending=False).reset_index(drop=True)
    best_model = str(overall.iloc[0]["model"])

    best_occ = occ_probs[occ_probs["model"] == best_model][["soc_code", "occupation_exposure", "ai_win_probability_occ"]].copy()
    d = ind24.merge(best_occ, left_on="occ_code", right_on="soc_code", how="left")
    d["occupation_exposure"] = d["occupation_exposure"].fillna(0.0)
    d["ai_win_probability_occ"] = d["ai_win_probability_occ"].fillna(float(overall.iloc[0]["model_global_win_rate"]))
    d["risk_prob_occ"] = d["occupation_exposure"] * d["ai_win_probability_occ"]
    d["expected_affected_emp"] = d["tot_emp"] * d["risk_prob_occ"]
    d["exposure_emp"] = d["tot_emp"] * d["occupation_exposure"]

    sec = (
        d.groupby(["sector_code", "sector_title"], as_index=False)
        .agg(total_emp=("tot_emp", "sum"), expected_affected_emp=("expected_affected_emp", "sum"), exposure_emp=("exposure_emp", "sum"))
    )
    sec["industry_emp_share"] = sec["total_emp"] / sec["total_emp"].sum()
    sec["industry_exposure"] = sec["exposure_emp"] / sec["total_emp"]
    sec["replacement_risk_probability"] = sec["expected_affected_emp"] / sec["total_emp"]
    sec["weighted_risk_contribution"] = sec["industry_emp_share"] * sec["replacement_risk_probability"]
    sec["effective_ai_win_probability"] = np.where(sec["exposure_emp"] > 0, sec["expected_affected_emp"] / sec["exposure_emp"], 0.0)
    sec = sec.sort_values("weighted_risk_contribution", ascending=False).reset_index(drop=True)

    summary = {
        "best_model": best_model,
        "best_model_national_replacement_risk_emp_weighted": float(overall.iloc[0]["national_replacement_risk_emp_weighted"]),
        "mapped_soc_count": int(soc_aligned_exposure["soc_code"].nunique()),
        "replaced_exposure_soc_count": int(occ_exp["aligned_occupation_exposure"].notna().sum()),
        "transfer": transfer_meta,
    }
    return occ_probs, overall, sec, summary


def build_report(
    mapping_detail: pd.DataFrame,
    task_alignment: pd.DataFrame,
    occ_aligned_exposure: pd.DataFrame,
    overall: pd.DataFrame,
    sec: pd.DataFrame,
    summary: Dict,
) -> str:
    best_model = summary["best_model"]
    mapped_task = int(task_alignment["aligned_task_exposure"].notna().sum())
    total_task = int(len(task_alignment))
    top_models = overall.head(12)
    top_occ = occ_aligned_exposure.sort_values("aligned_task_exposure_mean", ascending=False).head(20)

    lines: List[str] = []
    lines.append("# GDPval × 暴露度（任务级对齐版，Win-only）")
    lines.append("")
    lines.append("- 核心：先把 GDPval gold 任务映射到 O*NET 任务，再聚合成职业暴露度；然后与 GDPval 职业胜率相乘。")
    lines.append("- 风险定义：`risk_occ = exposure_occ(task-aligned) × p_win_occ`，`p_win_occ` 仅用 `win_rate`。")
    lines.append("- 行业与全国聚合：统一使用 IN4 2024 就业加权。")
    lines.append("")
    lines.append("## 任务与职业映射质量")
    lines.append("")
    lines.append(f"- GDPval 任务数: {total_task}")
    lines.append(f"- 成功任务对齐数: {mapped_task} ({mapped_task / max(total_task, 1):.1%})")
    lines.append(f"- GDPval 职业映射到 SOC 条目: {int(mapping_detail['soc_code'].notna().sum())}")
    lines.append(f"- 手工拆分映射职业数（按论文附录）: {int((mapping_detail['mapping_method'] == 'manual_split_from_paper_appendix').sum() > 0)}")
    lines.append(f"- 任务 top-1 相似度均值: {float(task_alignment['top_similarity'].fillna(0).mean()):.4f}")
    lines.append(f"- 任务 top-1 相似度 P10/P90: {float(task_alignment['top_similarity'].fillna(0).quantile(0.10)):.4f}/{float(task_alignment['top_similarity'].fillna(0).quantile(0.90)):.4f}")
    lines.append("")
    lines.append("## 职业暴露度（任务级对齐后，Top 20）")
    lines.append("")
    lines.append("| GDPval职业 | 对齐任务数 | 对齐暴露度(均值) | 暴露度标准差 | 相似度均值 |")
    lines.append("|---|---:|---:|---:|---:|")
    for _, r in top_occ.iterrows():
        lines.append(
            f"| {r['occupation']} | {int(r['aligned_task_count'])} | {r['aligned_task_exposure_mean']:.4f} | "
            f"{r['aligned_task_exposure_std']:.4f} | {r['top_similarity_mean']:.4f} |"
        )
    lines.append("")
    lines.append("## 全国总概率（按模型）")
    lines.append("")
    lines.append("| 模型 | 全局Win率 | 全国暴露度(就业加权) | 全国替代风险概率(就业加权) |")
    lines.append("|---|---:|---:|---:|")
    for _, r in top_models.iterrows():
        lines.append(
            f"| {r['model']} | {r['model_global_win_rate']:.4f} | "
            f"{r['national_exposure_emp_weighted']:.4f} | {r['national_replacement_risk_emp_weighted']:.4f} |"
        )
    lines.append("")
    lines.append(f"## 行业结果（最佳模型 `{best_model}`）")
    lines.append("")
    lines.append("| 行业大类 | 就业人数 | 暴露度 | 有效Win率 | 风险概率 | 对全国总风险贡献 |")
    lines.append("|---|---:|---:|---:|---:|---:|")
    for _, r in sec.head(20).iterrows():
        lines.append(
            f"| {r['sector_title']} ({r['sector_code']}) | {r['total_emp']:,.0f} | {r['industry_exposure']:.4f} | "
            f"{r['effective_ai_win_probability']:.4f} | {r['replacement_risk_probability']:.4f} | {r['weighted_risk_contribution']:.4f} |"
        )
    lines.append("")
    lines.append("## 输出文件")
    lines.append("")
    lines.append("- `output/onet_task_auto_full.csv`")
    lines.append("- `output/gdpval_occ_soc_mapping_task_aligned.csv`")
    lines.append("- `output/gdpval_task_level_alignment.csv`")
    lines.append("- `output/gdpval_occupation_aligned_exposure.csv`")
    lines.append("- `output/occupation_exposure_task_aligned.csv`")
    lines.append("- `output/occupation_win_probability_by_model_task_aligned.csv`")
    lines.append("- `output/overall_ai_replacement_probability_by_model_task_aligned.csv`")
    lines.append("- `output/industry_ai_replacement_risk_top_model_task_aligned.csv`")
    lines.append("- `output/task_aligned_method_summary.json`")
    return "\n".join(lines)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if not GDPVAL_GOLD_PATH.exists():
        raise FileNotFoundError(f"Missing GDPval gold file: {GDPVAL_GOLD_PATH}")

    occ_exposure_path = OUT_DIR / "occupation_task_exposure.csv"
    if not occ_exposure_path.exists():
        raise FileNotFoundError(f"Missing baseline exposure file: {occ_exposure_path}")
    occ_exposure = pd.read_csv(occ_exposure_path, dtype={"soc_code": str})

    gdp_tasks = pd.read_parquet(GDPVAL_GOLD_PATH)
    task_auto = load_task_auto_scores(force_refresh=False)

    align_outputs = build_task_alignment_outputs(
        gdp_tasks=gdp_tasks,
        task_auto=task_auto,
        occ_exposure=occ_exposure,
    )

    js = rig.fetch_bundle(force_refresh=True)
    parsed = rig.parse_gdpval(js)
    parsed.totals = parsed.totals[parsed.totals["model"] != "human"].reset_index(drop=True)
    parsed.by_occ = parsed.by_occ[parsed.by_occ["model"] != "human"].reset_index(drop=True)

    occ_probs, overall, sec, summary = compute_risk_with_task_aligned_exposure(
        occ_exposure_base=occ_exposure,
        soc_aligned_exposure=align_outputs.soc_aligned_exposure,
        mapping_detail=align_outputs.mapping_detail,
        parsed=parsed,
    )

    occ_compare = occ_exposure[["soc_code", "occupation_title", "occupation_exposure"]].merge(
        align_outputs.soc_aligned_exposure[["soc_code", "aligned_occupation_exposure"]], on="soc_code", how="left"
    )
    occ_compare["occupation_exposure_task_aligned"] = occ_compare["aligned_occupation_exposure"].where(
        occ_compare["aligned_occupation_exposure"].notna(), occ_compare["occupation_exposure"]
    )
    occ_compare["exposure_delta_task_aligned_minus_base"] = (
        occ_compare["occupation_exposure_task_aligned"] - occ_compare["occupation_exposure"]
    )

    # Save outputs.
    align_outputs.mapping_detail.to_csv(OUT_DIR / "gdpval_occ_soc_mapping_task_aligned.csv", index=False)
    align_outputs.task_alignment.to_csv(OUT_DIR / "gdpval_task_level_alignment.csv", index=False)
    align_outputs.occ_aligned_exposure.to_csv(OUT_DIR / "gdpval_occupation_aligned_exposure.csv", index=False)
    occ_compare.to_csv(OUT_DIR / "occupation_exposure_task_aligned.csv", index=False)
    occ_probs.to_csv(OUT_DIR / "occupation_win_probability_by_model_task_aligned.csv", index=False)
    overall.to_csv(OUT_DIR / "overall_ai_replacement_probability_by_model_task_aligned.csv", index=False)
    sec.to_csv(OUT_DIR / "industry_ai_replacement_risk_top_model_task_aligned.csv", index=False)
    with open(OUT_DIR / "task_aligned_method_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    report = build_report(
        mapping_detail=align_outputs.mapping_detail,
        task_alignment=align_outputs.task_alignment,
        occ_aligned_exposure=align_outputs.occ_aligned_exposure,
        overall=overall,
        sec=sec,
        summary=summary,
    )
    REPORT_PATH.write_text(report, encoding="utf-8")
    print(f"Done. Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
