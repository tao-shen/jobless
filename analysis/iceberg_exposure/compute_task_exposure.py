#!/usr/bin/env python3
"""Compute task-based AI exposure by occupation and industry (no wage weighting).

Method summary (adapted from Iceberg paper):
1) Occupation exposure aggregates task-level exposure with importance/prevalence weights.
2) Industry exposure aggregates occupation exposure with employment weights from BLS OEWS.
3) Growth is computed from 2019-2024 exposure time series.
"""

from __future__ import annotations

import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parent
ONET_DIR = ROOT / "data" / "raw" / "onet"
BLS_DIR = ROOT / "data" / "raw" / "bls"
OUT_DIR = ROOT / "output"

YEARS = [2019, 2020, 2021, 2022, 2023, 2024]


def to_float(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", "", regex=False), errors="coerce")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df


def safe_div(a: float, b: float) -> float:
    if b is None or b == 0 or np.isnan(b):
        return float("nan")
    return a / b


def cagr(start: float, end: float, periods: int) -> float:
    if periods <= 0:
        return float("nan")
    if start is None or end is None or start <= 0 or end <= 0:
        return float("nan")
    return (end / start) ** (1.0 / periods) - 1.0


def score_task_automatability(task_text: str) -> float:
    """Heuristic task-level AI automatability score in [0, 1]."""
    if not isinstance(task_text, str) or not task_text.strip():
        return 0.35

    t = task_text.lower()
    score = 0.35

    positive_strong = [
        "analyz",
        "analysis",
        "data",
        "report",
        "document",
        "record",
        "prepare",
        "schedule",
        "coordinat",
        "email",
        "correspondence",
        "budget",
        "financial",
        "accounting",
        "audit",
        "invoice",
        "billing",
        "code",
        "software",
        "program",
        "develop",
        "draft",
        "write",
        "edit",
        "research",
        "forecast",
        "estimate",
        "translat",
        "classify",
        "summar",
        "review documents",
    ]

    positive_medium = [
        "advise",
        "evaluate",
        "assess",
        "monitor",
        "track",
        "plan",
        "quality control",
        "customer service",
        "troubleshoot",
        "calculate",
        "verify",
        "process",
        "clerical",
        "administrative",
        "compliance",
    ]

    negative_strong = [
        "lift",
        "carry",
        "drive",
        "truck",
        "forklift",
        "operate machinery",
        "operate equipment",
        "repair",
        "install",
        "weld",
        "solder",
        "drill",
        "saw",
        "assemble",
        "cook",
        "clean",
        "harvest",
        "farm",
        "landscap",
        "construction",
        "roof",
        "pave",
        "firefighting",
        "arrest",
        "patrol",
        "surgery",
        "medication",
        "patient care",
        "physical",
        "hands-on",
        "manual",
    ]

    negative_medium = [
        "inspect equipment",
        "maintenance",
        "operate vehicle",
        "on-site",
        "field work",
        "climb",
        "kneel",
        "crawl",
        "stand for",
    ]

    pos_hits = sum(1 for k in positive_strong if k in t)
    pos_med_hits = sum(1 for k in positive_medium if k in t)
    neg_hits = sum(1 for k in negative_strong if k in t)
    neg_med_hits = sum(1 for k in negative_medium if k in t)

    score += min(pos_hits, 5) * 0.10
    score += min(pos_med_hits, 4) * 0.05
    score -= min(neg_hits, 5) * 0.12
    score -= min(neg_med_hits, 4) * 0.05

    if any(k in t for k in ["type", "enter", "compile", "summarize", "draft", "respond to emails"]):
        score += 0.08
    if any(k in t for k in ["operate heavy", "wiring", "plumbing", "mechanical", "construction site"]):
        score -= 0.10

    return float(np.clip(score, 0.02, 0.98))


def read_onet() -> pd.DataFrame:
    task_stmt = pd.read_csv(ONET_DIR / "Task%20Statements.txt", sep="\t", dtype=str)
    task_ratings = pd.read_csv(ONET_DIR / "Task%20Ratings.txt", sep="\t", dtype=str)
    occ_data = pd.read_csv(ONET_DIR / "Occupation%20Data.txt", sep="\t", dtype=str)

    task_stmt = normalize_columns(task_stmt).rename(
        columns={
            "o*net-soc code": "onet_soc_code",
            "task id": "task_id",
            "task": "task_text",
            "task type": "task_type",
        }
    )
    task_ratings = normalize_columns(task_ratings).rename(
        columns={
            "o*net-soc code": "onet_soc_code",
            "task id": "task_id",
            "scale id": "scale_id",
            "category": "category",
            "data value": "data_value",
        }
    )
    occ_data = normalize_columns(occ_data).rename(
        columns={
            "o*net-soc code": "onet_soc_code",
            "title": "title",
        }
    )

    task_ratings["data_value"] = to_float(task_ratings["data_value"])
    task_ratings["category_num"] = to_float(task_ratings["category"])

    im = (
        task_ratings[task_ratings["scale_id"] == "IM"]
        .groupby(["onet_soc_code", "task_id"], as_index=False)["data_value"]
        .mean()
        .rename(columns={"data_value": "im"})
    )
    rt = (
        task_ratings[task_ratings["scale_id"] == "RT"]
        .groupby(["onet_soc_code", "task_id"], as_index=False)["data_value"]
        .mean()
        .rename(columns={"data_value": "rt"})
    )
    ft_raw = task_ratings[task_ratings["scale_id"] == "FT"].copy()
    ft = (
        ft_raw.assign(weighted=ft_raw["category_num"] * ft_raw["data_value"])
        .groupby(["onet_soc_code", "task_id"], as_index=False)
        .agg(ft_weighted=("weighted", "sum"), ft_total=("data_value", "sum"))
    )
    ft["ft_expected"] = ft["ft_weighted"] / ft["ft_total"]
    ft = ft[["onet_soc_code", "task_id", "ft_expected"]]

    task = (
        task_stmt[["onet_soc_code", "task_id", "task_text", "task_type"]]
        .drop_duplicates(["onet_soc_code", "task_id"])
        .merge(im, on=["onet_soc_code", "task_id"], how="left")
        .merge(rt, on=["onet_soc_code", "task_id"], how="left")
        .merge(ft, on=["onet_soc_code", "task_id"], how="left")
    )

    # Normalize weighting dimensions.
    task["importance_norm"] = ((task["im"] - 1.0) / 4.0).clip(lower=0, upper=1)
    task["rt_norm"] = (task["rt"] / 100.0).clip(lower=0, upper=1)
    task["ft_norm"] = ((task["ft_expected"] - 1.0) / 6.0).clip(lower=0, upper=1)

    task["prevalence"] = np.where(
        task["rt_norm"].notna() & task["ft_norm"].notna(),
        0.5 * task["rt_norm"] + 0.5 * task["ft_norm"],
        np.where(task["rt_norm"].notna(), task["rt_norm"], np.where(task["ft_norm"].notna(), task["ft_norm"], 0.5)),
    )
    task["importance_norm"] = task["importance_norm"].fillna(task["importance_norm"].median())
    task["task_weight"] = (task["importance_norm"] * task["prevalence"]).clip(lower=0.01)

    task["task_auto_score"] = task["task_text"].map(score_task_automatability)
    task["soc_code"] = task["onet_soc_code"].str.extract(r"(\d{2}-\d{4})")
    task = task[task["soc_code"].notna()].copy()

    occ_data["soc_code"] = occ_data["onet_soc_code"].str.extract(r"(\d{2}-\d{4})")
    occ_data["is_base_variant"] = occ_data["onet_soc_code"].str.endswith(".00")
    occ_title = (
        occ_data.sort_values(["soc_code", "is_base_variant"], ascending=[True, False])
        .drop_duplicates("soc_code")[["soc_code", "title"]]
        .rename(columns={"title": "occupation_title"})
    )

    occ = (
        task.groupby("soc_code", as_index=False)
        .agg(
            task_weight_sum=("task_weight", "sum"),
            weighted_auto=("task_auto_score", lambda s: np.nan),
            task_count=("task_id", "nunique"),
        )
    )
    weighted = task.assign(w=task["task_weight"] * task["task_auto_score"]).groupby("soc_code", as_index=False).agg(
        weighted_num=("w", "sum"), weight_den=("task_weight", "sum")
    )
    occ = occ.drop(columns=["weighted_auto"]).merge(weighted, on="soc_code", how="left")
    occ["occupation_exposure"] = occ["weighted_num"] / occ["weight_den"]
    occ = occ.merge(occ_title, on="soc_code", how="left")
    occ = occ.sort_values("occupation_exposure", ascending=False).reset_index(drop=True)

    return occ[["soc_code", "occupation_title", "occupation_exposure", "task_count", "weight_den"]]


def read_bls_excel(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path, dtype=str)
    return normalize_columns(df)


def resolve_in4_file(year: int) -> Path:
    pattern = f"nat4d_M{year}_dl.xlsx"
    matches = list((BLS_DIR / f"oesm{str(year)[-2:]}in4").rglob(pattern))
    if not matches:
        raise FileNotFoundError(f"Cannot find {pattern}")
    return matches[0]


def resolve_nat_file(year: int) -> Path:
    pattern = f"national_M{year}_dl.xlsx"
    matches = list((BLS_DIR / f"oesm{str(year)[-2:]}nat").rglob(pattern))
    if not matches:
        raise FileNotFoundError(f"Cannot find {pattern}")
    return matches[0]


def normalize_sector_code(naics_code: str) -> str:
    if not isinstance(naics_code, str) or len(naics_code) < 2 or not naics_code[:2].isdigit():
        return "NA"
    code = naics_code[:2]
    if code in {"31", "32", "33"}:
        return "31-33"
    if code in {"44", "45"}:
        return "44-45"
    if code in {"48", "49"}:
        return "48-49"
    return code


SECTOR_TITLE = {
    "11": "Agriculture, Forestry, Fishing and Hunting",
    "21": "Mining, Quarrying, and Oil and Gas Extraction",
    "22": "Utilities",
    "23": "Construction",
    "31-33": "Manufacturing",
    "42": "Wholesale Trade",
    "44-45": "Retail Trade",
    "48-49": "Transportation and Warehousing",
    "51": "Information",
    "52": "Finance and Insurance",
    "53": "Real Estate and Rental and Leasing",
    "54": "Professional, Scientific, and Technical Services",
    "55": "Management of Companies and Enterprises",
    "56": "Administrative and Support and Waste Management and Remediation Services",
    "61": "Educational Services",
    "62": "Health Care and Social Assistance",
    "71": "Arts, Entertainment, and Recreation",
    "72": "Accommodation and Food Services",
    "81": "Other Services (except Public Administration)",
    "92": "Public Administration",
    "99": "Government and Special Designation Sectors",
    "NA": "Unknown",
}


def read_year_industry_exposure(year: int, occ_exposure: pd.DataFrame) -> pd.DataFrame:
    df = read_bls_excel(resolve_in4_file(year))
    # Harmonize fields across years.
    required = {"naics", "naics_title", "occ_code", "o_group", "tot_emp"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"{year} missing columns: {missing}")

    if "area" in df.columns:
        df = df[df["area"].astype(str) == "99"]

    d = df[df["o_group"].str.lower() == "detailed"].copy()
    d = d[d["naics"].astype(str).str.fullmatch(r"\d{6}", na=False)]
    d["tot_emp"] = to_float(d["tot_emp"])
    d = d[d["tot_emp"].notna() & (d["tot_emp"] > 0)]

    d = d.merge(occ_exposure[["soc_code", "occupation_exposure"]], left_on="occ_code", right_on="soc_code", how="left")
    d["occupation_exposure"] = d["occupation_exposure"].fillna(0.0)
    d["matched_emp"] = np.where(d["occupation_exposure"] > 0, d["tot_emp"], 0.0)
    d["exposed_emp"] = d["tot_emp"] * d["occupation_exposure"]

    out = (
        d.groupby(["naics", "naics_title"], as_index=False)
        .agg(total_emp=("tot_emp", "sum"), matched_emp=("matched_emp", "sum"), exposed_emp=("exposed_emp", "sum"))
        .assign(
            year=year,
            industry_exposure=lambda x: x["exposed_emp"] / x["total_emp"],
            match_rate=lambda x: x["matched_emp"] / x["total_emp"],
        )
    )
    out["sector_code"] = out["naics"].map(normalize_sector_code)
    out["sector_title"] = out["sector_code"].map(SECTOR_TITLE).fillna("Unknown")
    return out


def read_year_national_occupation(year: int, occ_exposure: pd.DataFrame) -> pd.DataFrame:
    df = read_bls_excel(resolve_nat_file(year))
    required = {"occ_code", "occ_title", "o_group", "tot_emp"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"{year} missing columns in national file: {missing}")

    d = df[df["o_group"].str.lower() == "detailed"].copy()
    d["tot_emp"] = to_float(d["tot_emp"])
    d = d[d["tot_emp"].notna() & (d["tot_emp"] > 0)]
    d = d.merge(occ_exposure[["soc_code", "occupation_exposure", "occupation_title"]], left_on="occ_code", right_on="soc_code", how="left")
    d["occupation_exposure"] = d["occupation_exposure"].fillna(0.0)
    d["occupation_title"] = d["occupation_title"].fillna(d["occ_title"])
    d["exposed_emp"] = d["tot_emp"] * d["occupation_exposure"]
    d["year"] = year
    return d[["year", "occ_code", "occupation_title", "tot_emp", "occupation_exposure", "exposed_emp"]]


def add_growth(df: pd.DataFrame, id_cols: List[str], value_col: str, years: List[int]) -> pd.DataFrame:
    wide = df.pivot_table(index=id_cols, columns="year", values=value_col, aggfunc="first").reset_index()
    y0, y1 = years[0], years[-1]
    if y0 in wide.columns and y1 in wide.columns:
        wide[f"{value_col}_chg_{y0}_{y1}"] = wide[y1] - wide[y0]
        wide[f"{value_col}_pct_{y0}_{y1}"] = (wide[y1] / wide[y0]) - 1.0
        wide[f"{value_col}_cagr_{y0}_{y1}"] = wide.apply(lambda r: cagr(r[y0], r[y1], y1 - y0), axis=1)
    prev = years[-2]
    if prev in wide.columns and y1 in wide.columns:
        wide[f"{value_col}_yoy_{prev}_{y1}"] = (wide[y1] / wide[prev]) - 1.0
    return wide


def format_pct(x: float) -> str:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return "NA"
    return f"{x * 100:.2f}%"


def build_report(
    occ: pd.DataFrame,
    industry_ts: pd.DataFrame,
    sector_ts: pd.DataFrame,
    industry_growth: pd.DataFrame,
    sector_growth: pd.DataFrame,
    occ_growth: pd.DataFrame,
    national_ts: pd.DataFrame,
) -> str:
    y0, y1 = YEARS[0], YEARS[-1]
    national_y = national_ts.groupby("year", as_index=False).agg(total_emp=("tot_emp", "sum"), exposed_emp=("exposed_emp", "sum"))
    national_y["national_exposure"] = national_y["exposed_emp"] / national_y["total_emp"]
    start_val = float(national_y.loc[national_y["year"] == y0, "national_exposure"].iloc[0])
    end_val = float(national_y.loc[national_y["year"] == y1, "national_exposure"].iloc[0])
    nat_cagr = cagr(start_val, end_val, y1 - y0)

    top_occ = occ.sort_values("occupation_exposure", ascending=False).head(20).copy()
    top_industry_2024 = industry_ts[industry_ts["year"] == y1].sort_values("industry_exposure", ascending=False).head(20).copy()
    top_sector_2024 = sector_ts[sector_ts["year"] == y1].sort_values("industry_exposure", ascending=False).head(20).copy()

    fastest_sector = sector_growth.sort_values(f"industry_exposure_cagr_{y0}_{y1}", ascending=False).head(15).copy()
    occ_growth_base = occ_growth.copy()
    if y0 in occ_growth_base.columns and y1 in occ_growth_base.columns:
        occ_growth_base = occ_growth_base[(occ_growth_base[y0] >= 5000) & (occ_growth_base[y1] >= 5000)]
    fastest_occ_volume = occ_growth_base.sort_values(f"exposed_emp_cagr_{y0}_{y1}", ascending=False).head(20).copy()

    lines: List[str] = []
    lines.append("# 任务暴露度（不使用工资权重）计算报告")
    lines.append("")
    lines.append(f"- 生成时间（UTC）: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"- 口径区间: {y0}-{y1}")
    lines.append("- 数据源:")
    lines.append("  - O*NET 30.1: Task Statements / Task Ratings / Occupation Data")
    lines.append("  - BLS OEWS: National industry-specific (`oesmYYin4`) + National occupation (`oesmYYnat`)")
    lines.append("")
    lines.append("## 方法（按 Iceberg 思路改造为“纯任务暴露度”）")
    lines.append("")
    lines.append("论文方法核心是“任务/技能要求 × 可自动化程度 × 聚合权重”。本次按你的要求，去掉工资权重，改为任务+就业口径：")
    lines.append("")
    lines.append("1. 任务权重")
    lines.append("   - `Importance(IM)`（1-5）归一化")
    lines.append("   - `Prevalence` 用 `RT`（任务相关性）与 `FT`（任务频率分布）合成")
    lines.append("   - `w_t = Importance_t × Prevalence_t`")
    lines.append("2. 任务可暴露度")
    lines.append("   - 依据任务文本做规则化 AI 可自动化打分 `a_t ∈ [0,1]`")
    lines.append("3. 职业暴露度")
    lines.append("   - `Exposure_occ = Σ(w_t × a_t) / Σ(w_t)`")
    lines.append("4. 行业暴露度（不使用工资）")
    lines.append("   - `Exposure_ind,year = Σ(emp_occ,ind,year × Exposure_occ) / Σ(emp_occ,ind,year)`")
    lines.append("5. 增速")
    lines.append("   - 同比：`YoY = Exposure_t / Exposure_{t-1} - 1`")
    lines.append(f"   - 复合增速：`CAGR({y0}-{y1}) = (Exposure_{y1}/Exposure_{y0})^(1/{y1-y0}) - 1`")
    lines.append("")
    lines.append("> 注：论文原文使用“工资价值”聚合；本报告严格按你的要求移除工资权重，仅在行业聚合时使用就业人数。")
    lines.append("")
    lines.append("## 总体结果")
    lines.append("")
    lines.append(f"- 全国任务暴露度（就业加权）: {start_val:.4f} ({y0}) → {end_val:.4f} ({y1})")
    lines.append(f"- 全国任务暴露度 CAGR({y0}-{y1}): {format_pct(nat_cagr)}")
    lines.append("")

    lines.append(f"## 暴露度最高的职业（Top 20，{y1}口径）")
    lines.append("")
    lines.append("| SOC | 职业 | 任务暴露度 |")
    lines.append("|---|---|---:|")
    for _, r in top_occ.iterrows():
        lines.append(f"| {r['soc_code']} | {r['occupation_title']} | {r['occupation_exposure']:.4f} |")
    lines.append("")

    lines.append(f"## 暴露度最高的行业（NAICS 4-digit，Top 20，{y1}）")
    lines.append("")
    lines.append("| NAICS | 行业 | 任务暴露度 |")
    lines.append("|---|---|---:|")
    for _, r in top_industry_2024.iterrows():
        lines.append(f"| {r['naics']} | {r['naics_title']} | {r['industry_exposure']:.4f} |")
    lines.append("")

    lines.append(f"## 暴露度最高的行业大类（2-digit/组合，{y1}）")
    lines.append("")
    lines.append("| 行业大类 | 任务暴露度 |")
    lines.append("|---|---:|")
    for _, r in top_sector_2024.iterrows():
        lines.append(f"| {r['sector_title']} ({r['sector_code']}) | {r['industry_exposure']:.4f} |")
    lines.append("")

    lines.append(f"## 行业暴露度增速最快（按大类 CAGR，{y0}-{y1}，Top 15）")
    lines.append("")
    lines.append("| 行业大类 | 暴露度CAGR | 暴露度同比(2023-2024) |")
    lines.append("|---|---:|---:|")
    for _, r in fastest_sector.iterrows():
        lines.append(
            f"| {r['sector_title']} ({r['sector_code']}) | "
            f"{format_pct(r[f'industry_exposure_cagr_{y0}_{y1}'])} | "
            f"{format_pct(r[f'industry_exposure_yoy_{YEARS[-2]}_{y1}'])} |"
        )
    lines.append("")

    lines.append(f"## 暴露任务就业量增速最快的职业（Top 20，{y0}-{y1}）")
    lines.append("")
    lines.append("| SOC | 职业 | 暴露任务就业量CAGR | 暴露任务就业量同比(2023-2024) |")
    lines.append("|---|---|---:|---:|")
    for _, r in fastest_occ_volume.iterrows():
        lines.append(
            f"| {r['occ_code']} | {r['occupation_title']} | "
            f"{format_pct(r[f'exposed_emp_cagr_{y0}_{y1}'])} | "
            f"{format_pct(r[f'exposed_emp_yoy_{YEARS[-2]}_{y1}'])} |"
        )
    lines.append("")

    lines.append("## 结果文件")
    lines.append("")
    lines.append("- `output/occupation_task_exposure.csv`")
    lines.append("- `output/industry_exposure_by_year_naics4.csv`")
    lines.append("- `output/industry_exposure_growth_naics4.csv`")
    lines.append("- `output/industry_exposure_by_year_sector.csv`")
    lines.append("- `output/industry_exposure_growth_sector.csv`")
    lines.append("- `output/occupation_exposure_timeseries.csv`")
    lines.append("- `output/occupation_exposed_employment_growth.csv`")
    lines.append("- `output/summary_metrics.json`")
    lines.append("")
    lines.append("## 局限说明")
    lines.append("")
    lines.append("- 论文中的“AI 工具能力矩阵（13k+工具）”未公开，本实现用任务文本规则打分替代。")
    lines.append("- 职业暴露度基于当前 O*NET 版本，职业本身的任务暴露度在年际上近似固定；时间变化主要来自就业结构变化。")
    lines.append("- 行业口径采用 OEWS 可发布单元（含不同 ownership code），与纯 NAICS 总量统计口径可能有细微差异。")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    occ_exposure = read_onet()
    occ_exposure.to_csv(OUT_DIR / "occupation_task_exposure.csv", index=False)

    industry_year = []
    occ_year = []
    for year in YEARS:
        industry_year.append(read_year_industry_exposure(year, occ_exposure))
        occ_year.append(read_year_national_occupation(year, occ_exposure))

    industry_ts = pd.concat(industry_year, ignore_index=True)
    occ_ts = pd.concat(occ_year, ignore_index=True)

    sector_ts = (
        industry_ts.groupby(["year", "sector_code", "sector_title"], as_index=False)
        .agg(total_emp=("total_emp", "sum"), exposed_emp=("exposed_emp", "sum"), matched_emp=("matched_emp", "sum"))
        .assign(industry_exposure=lambda x: x["exposed_emp"] / x["total_emp"], match_rate=lambda x: x["matched_emp"] / x["total_emp"])
    )

    industry_growth = add_growth(industry_ts, ["naics", "naics_title", "sector_code", "sector_title"], "industry_exposure", YEARS)
    industry_growth_emp = add_growth(industry_ts, ["naics", "naics_title", "sector_code", "sector_title"], "exposed_emp", YEARS)
    industry_growth = industry_growth.merge(
        industry_growth_emp[
            ["naics", "naics_title", f"exposed_emp_cagr_{YEARS[0]}_{YEARS[-1]}", f"exposed_emp_yoy_{YEARS[-2]}_{YEARS[-1]}"]
        ],
        on=["naics", "naics_title"],
        how="left",
    )

    sector_growth = add_growth(sector_ts, ["sector_code", "sector_title"], "industry_exposure", YEARS)
    sector_growth_emp = add_growth(sector_ts, ["sector_code", "sector_title"], "exposed_emp", YEARS)
    sector_growth = sector_growth.merge(
        sector_growth_emp[
            ["sector_code", "sector_title", f"exposed_emp_cagr_{YEARS[0]}_{YEARS[-1]}", f"exposed_emp_yoy_{YEARS[-2]}_{YEARS[-1]}"]
        ],
        on=["sector_code", "sector_title"],
        how="left",
    )

    occ_growth = add_growth(occ_ts, ["occ_code", "occupation_title"], "exposed_emp", YEARS)
    occ_growth_emp = add_growth(occ_ts, ["occ_code", "occupation_title"], "tot_emp", YEARS)
    occ_growth = occ_growth.merge(
        occ_growth_emp[["occ_code", "occupation_title", f"tot_emp_cagr_{YEARS[0]}_{YEARS[-1]}", f"tot_emp_yoy_{YEARS[-2]}_{YEARS[-1]}"]],
        on=["occ_code", "occupation_title"],
        how="left",
    )

    industry_ts.to_csv(OUT_DIR / "industry_exposure_by_year_naics4.csv", index=False)
    industry_growth.to_csv(OUT_DIR / "industry_exposure_growth_naics4.csv", index=False)
    sector_ts.to_csv(OUT_DIR / "industry_exposure_by_year_sector.csv", index=False)
    sector_growth.to_csv(OUT_DIR / "industry_exposure_growth_sector.csv", index=False)
    occ_ts.to_csv(OUT_DIR / "occupation_exposure_timeseries.csv", index=False)
    occ_growth.to_csv(OUT_DIR / "occupation_exposed_employment_growth.csv", index=False)

    # Summary metrics
    national = occ_ts.groupby("year", as_index=False).agg(total_emp=("tot_emp", "sum"), exposed_emp=("exposed_emp", "sum"))
    national["national_exposure"] = national["exposed_emp"] / national["total_emp"]
    summary = {
        "years": YEARS,
        "national_exposure": [
            {"year": int(r.year), "exposure": float(r.national_exposure), "total_emp": float(r.total_emp), "exposed_emp": float(r.exposed_emp)}
            for r in national.itertuples(index=False)
        ],
        "occupation_count": int(occ_exposure["soc_code"].nunique()),
        "industry_count_2024": int(industry_ts[industry_ts["year"] == YEARS[-1]]["naics"].nunique()),
        "sector_count_2024": int(sector_ts[sector_ts["year"] == YEARS[-1]]["sector_code"].nunique()),
    }
    with open(OUT_DIR / "summary_metrics.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    report = build_report(occ_exposure, industry_ts, sector_ts, industry_growth, sector_growth, occ_growth, occ_ts)
    (ROOT / "task_exposure_report.md").write_text(report, encoding="utf-8")

    print("Done.")
    print(f"Report: {ROOT / 'task_exposure_report.md'}")
    print(f"Output dir: {OUT_DIR}")


if __name__ == "__main__":
    main()
