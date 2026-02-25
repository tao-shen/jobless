#!/usr/bin/env python3
"""Compute AI replacement risk probability from GDPval leaderboard.

Risk definition:
    replacement_risk_probability = exposure * p(ai_wins)

where exposure comes from local industry exposure outputs, and p(ai_wins)
comes from GDPval leaderboard win_rate.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
import requests


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output"
REPORT_PATH = ROOT / "gdpval_replacement_risk_report.md"
JS_CACHE = ROOT / "data" / "raw" / "gdpval" / "leaderboard_bundle.js"

GDPVAL_LEADERBOARD_URL = "https://evals.openai.com/gdpval/leaderboard"
GDPVAL_BUNDLE_URL = "https://evals.openai.com/assets/index-BeFXzkDd.js"

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}


SECTOR_TO_GDPVAL = {
    "Finance and Insurance": "Finance and Insurance",
    "Government and Special Designation Sectors": "Government",
    "Health Care and Social Assistance": "Health Care and Social Assistance",
    "Information": "Information",
    "Manufacturing": "Manufacturing",
    "Professional, Scientific, and Technical Services": "Professional, Scientific, and Technical Services",
    "Real Estate and Rental and Leasing": "Real Estate and Rental and Leasing",
    "Retail Trade": "Retail Trade",
    "Wholesale Trade": "Wholesale Trade",
}


@dataclass
class ParsedGDPval:
    totals: pd.DataFrame
    by_sector: pd.DataFrame


def fetch_bundle(force_refresh: bool = False) -> str:
    JS_CACHE.parent.mkdir(parents=True, exist_ok=True)
    if JS_CACHE.exists() and not force_refresh:
        return JS_CACHE.read_text(encoding="utf-8")
    txt = requests.get(GDPVAL_BUNDLE_URL, headers=UA, timeout=60).text
    JS_CACHE.write_text(txt, encoding="utf-8")
    return txt


def parse_float_js(token: str) -> float:
    t = token.strip()
    if t.startswith("."):
        t = "0" + t
    if t == "-.0":
        t = "0"
    return float(t)


def parse_gdpval_data(js_text: str) -> ParsedGDPval:
    # totals block: GI=[{model:"...",win_rate:...,win_or_tie_rate:...},...],$I={totals:GI}
    m = re.search(r"GI=\[(.*?)\],\$I=\{totals:GI\}", js_text, re.DOTALL)
    if not m:
        raise RuntimeError("Cannot locate GDPval totals block in JS bundle.")
    totals_block = m.group(1)
    totals_rows = re.findall(
        r'\{model:"([^"]+)",win_rate:([^,}]+),win_or_tie_rate:([^,}]+)\}',
        totals_block,
    )
    totals = pd.DataFrame(
        [
            {
                "model": model,
                "win_rate": parse_float_js(w),
                "win_or_tie_rate": parse_float_js(wt),
            }
            for model, w, wt in totals_rows
        ]
    )

    # by-sector rows are spread across model arrays; extract all.
    sector_rows = re.findall(
        r'\{model:"([^"]+)",sector:"([^"]+)",win_rate:([^,}]+),win_or_tie_rate:([^,}]+)\}',
        js_text,
    )
    by_sector = pd.DataFrame(
        [
            {
                "model": model,
                "gdpval_sector": sector,
                "win_rate": parse_float_js(w),
                "win_or_tie_rate": parse_float_js(wt),
            }
            for model, sector, w, wt in sector_rows
        ]
    ).drop_duplicates(["model", "gdpval_sector"])

    return ParsedGDPval(totals=totals, by_sector=by_sector)


def load_latest_exposure() -> pd.DataFrame:
    p = OUT_DIR / "industry_exposure_by_year_sector.csv"
    if not p.exists():
        raise FileNotFoundError(f"Missing exposure file: {p}")
    df = pd.read_csv(p)
    latest_year = int(df["year"].max())
    latest = df[df["year"] == latest_year].copy()
    latest["gdpval_sector"] = latest["sector_title"].map(SECTOR_TO_GDPVAL)
    latest["year"] = latest_year
    return latest


def build_replacement_risk(latest: pd.DataFrame, parsed: ParsedGDPval) -> Tuple[pd.DataFrame, pd.DataFrame, str]:
    totals = parsed.totals.copy()
    totals = totals[totals["model"] != "human"].copy()
    if totals.empty:
        raise RuntimeError("No non-human model totals found in GDPval data.")

    best_model = totals.sort_values("win_rate", ascending=False).iloc[0]["model"]

    all_rows: List[pd.DataFrame] = []
    for model in totals["model"].tolist():
        overall_win = float(totals.loc[totals["model"] == model, "win_rate"].iloc[0])
        overall_win_or_tie = float(totals.loc[totals["model"] == model, "win_or_tie_rate"].iloc[0])
        sector_rates = parsed.by_sector[parsed.by_sector["model"] == model][
            ["gdpval_sector", "win_rate", "win_or_tie_rate"]
        ].rename(columns={"win_rate": "sector_win_rate", "win_or_tie_rate": "sector_win_or_tie_rate"})

        d = latest.copy()
        d = d.merge(sector_rates, on="gdpval_sector", how="left")
        # Win-only per user instruction: ties are excluded.
        d["ai_win_probability"] = d["sector_win_rate"].fillna(overall_win)
        d["ai_win_prob_source"] = d["sector_win_rate"].notna().map(
            {True: "gdpval_sector", False: "gdpval_overall_fallback"}
        )
        d["replacement_risk_probability"] = d["industry_exposure"] * d["ai_win_probability"]
        d["expected_affected_employment"] = d["replacement_risk_probability"] * d["total_emp"]
        d["model"] = model
        d["model_overall_win_rate"] = overall_win
        d["model_overall_win_or_tie_rate"] = overall_win_or_tie
        all_rows.append(d)

    industry_risk = pd.concat(all_rows, ignore_index=True)
    industry_risk["industry_emp_share"] = industry_risk.groupby("model")["total_emp"].transform(lambda x: x / x.sum())
    industry_risk["weighted_risk_contribution"] = (
        industry_risk["replacement_risk_probability"] * industry_risk["industry_emp_share"]
    )
    industry_risk["exposure_emp"] = industry_risk["industry_exposure"] * industry_risk["total_emp"]

    overall = (
        industry_risk.groupby("model", as_index=False)
        .agg(
            model_overall_win_rate=("model_overall_win_rate", "first"),
            model_overall_win_or_tie_rate=("model_overall_win_or_tie_rate", "first"),
            national_total_employment=("total_emp", "sum"),
            national_exposure_emp_sum=("exposure_emp", "sum"),
            national_replacement_risk_emp_sum=("expected_affected_employment", "sum"),
        )
        .assign(
            national_exposure_emp_weighted=lambda x: x["national_exposure_emp_sum"] / x["national_total_employment"],
            national_replacement_risk_emp_weighted=lambda x: x["national_replacement_risk_emp_sum"] / x["national_total_employment"],
        )
        .sort_values("national_replacement_risk_emp_weighted", ascending=False)
    )
    return industry_risk, overall, best_model


def build_markdown_report(
    latest_year: int,
    industry_risk: pd.DataFrame,
    overall: pd.DataFrame,
    best_model: str,
) -> str:
    best_sector = (
        industry_risk[industry_risk["model"] == best_model]
        .sort_values("weighted_risk_contribution", ascending=False)
        .copy()
    )
    top_models = overall.head(10)

    lines: List[str] = []
    lines.append("# GDPval × 暴露度：AI替代风险概率")
    lines.append("")
    lines.append(f"- 年份: {latest_year}")
    lines.append("- 定义: `AI替代风险概率 = 行业暴露度 × AI胜出概率(win_rate)`")
    lines.append(f"- 基准模型（按win_rate最高）: `{best_model}`")
    lines.append("")
    lines.append("## 总概率（按行业人数加权）")
    lines.append("")
    lines.append("| 模型 | GDPval总胜率 | GDPval总胜或平率 | 全国暴露度(就业加权) | 全国替代风险概率(就业加权, 仅胜出) |")
    lines.append("|---|---:|---:|---:|---:|")
    for _, r in top_models.iterrows():
        lines.append(
            f"| {r['model']} | {r['model_overall_win_rate']:.4f} | {r['model_overall_win_or_tie_rate']:.4f} | "
            f"{r['national_exposure_emp_weighted']:.4f} | {r['national_replacement_risk_emp_weighted']:.4f} |"
        )
    lines.append("")
    lines.append(f"## 各行业风险概率（基准模型 `{best_model}`，按行业人数加权贡献排序）")
    lines.append("")
    lines.append("| 行业大类 | 就业人数 | 行业人数占比 | 暴露度 | AI胜出概率 | 替代风险概率 | 对全国总风险贡献 | 预计受影响就业人数 | AI胜率来源 |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|---:|---|")
    for _, r in best_sector.iterrows():
        lines.append(
            f"| {r['sector_title']} ({r['sector_code']}) | {r['total_emp']:,.0f} | {r['industry_emp_share']:.4f} | "
            f"{r['industry_exposure']:.4f} | {r['ai_win_probability']:.4f} | {r['replacement_risk_probability']:.4f} | "
            f"{r['weighted_risk_contribution']:.4f} | {r['expected_affected_employment']:,.0f} | {r['ai_win_prob_source']} |"
        )
    lines.append("")
    lines.append("## 说明")
    lines.append("")
    lines.append("- GDPval有行业分项的行业，使用对应行业`win_rate`。")
    lines.append("- 没有行业分项的行业，回退使用该模型GDPval总`win_rate`。")
    lines.append("- 本版严格不计打平。")
    lines.append("- 行业表中的“对全国总风险贡献”按`行业人数占比 × 行业替代风险概率`计算，求和即全国总概率。")
    lines.append("")
    lines.append("## 输出文件")
    lines.append("")
    lines.append("- `output/gdpval_model_totals.csv`")
    lines.append("- `output/gdpval_model_sector_win_rates.csv`")
    lines.append("- `output/industry_ai_replacement_risk_by_model_sector.csv`")
    lines.append("- `output/overall_ai_replacement_probability_by_model.csv`")
    lines.append("- `output/industry_ai_replacement_risk_top_model.csv`")
    return "\n".join(lines)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    js = fetch_bundle(force_refresh=True)
    parsed = parse_gdpval_data(js)
    latest = load_latest_exposure()
    latest_year = int(latest["year"].iloc[0])

    industry_risk, overall, best_model = build_replacement_risk(latest, parsed)

    parsed.totals.sort_values("win_rate", ascending=False).to_csv(OUT_DIR / "gdpval_model_totals.csv", index=False)
    parsed.by_sector.sort_values(["model", "gdpval_sector"]).to_csv(
        OUT_DIR / "gdpval_model_sector_win_rates.csv", index=False
    )
    industry_risk.sort_values(["model", "replacement_risk_probability"], ascending=[True, False]).to_csv(
        OUT_DIR / "industry_ai_replacement_risk_by_model_sector.csv", index=False
    )
    overall.to_csv(OUT_DIR / "overall_ai_replacement_probability_by_model.csv", index=False)
    industry_risk[industry_risk["model"] == best_model].sort_values(
        "weighted_risk_contribution", ascending=False
    ).to_csv(OUT_DIR / "industry_ai_replacement_risk_top_model.csv", index=False)

    report = build_markdown_report(latest_year, industry_risk, overall, best_model)
    REPORT_PATH.write_text(report, encoding="utf-8")

    summary = {
        "year": latest_year,
        "best_model_by_win_rate": best_model,
        "best_model_overall": overall[overall["model"] == best_model].iloc[0].to_dict(),
    }
    with open(OUT_DIR / "gdpval_replacement_risk_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"Done. Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
