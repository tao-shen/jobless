#!/usr/bin/env python3
"""Estimate monthly growth of AI replacement risk.

Method:
1) Exposure trend from BLS-backed annual exposure series (2019-2024).
2) Capability trend from GDPval win_rate with model release dates.
3) Combine to estimate monthly growth in replacement risk.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output"
REPORT_PATH = ROOT / "risk_growth_monthly_report.md"

EXPOSURE_TS_PATH = OUT_DIR / "industry_exposure_by_year_sector.csv"
RISK_MODEL_PATH = OUT_DIR / "overall_ai_replacement_probability_by_model_task_aligned.csv"


@dataclass
class GrowthEst:
    monthly_cagr: float
    monthly_log_reg: float
    annualized_from_cagr: float
    annualized_from_log_reg: float


@dataclass
class AbsGrowthEst:
    mean_pp_per_month: float
    median_pp_per_month: float
    ols_pp_per_month: float
    theilsen_pp_per_month: float


def month_diff(d0: pd.Timestamp, d1: pd.Timestamp) -> int:
    return (d1.year - d0.year) * 12 + (d1.month - d0.month)


def model_release_reference() -> pd.DataFrame:
    rows: List[Dict] = [
        # OpenAI
        {
            "model": "gpt-4o",
            "family": "GPT-4o",
            "release_date": "2024-05-13",
            "source_url": "https://openai.com/index/hello-gpt-4o/",
            "assumption": "official launch date",
        },
        {
            "model": "o3-high",
            "family": "o3",
            "release_date": "2025-04-16",
            "source_url": "https://openai.com/index/introducing-o3-and-o4-mini/",
            "assumption": "o3 family launch date",
        },
        {
            "model": "o3-medium",
            "family": "o3",
            "release_date": "2025-04-16",
            "source_url": "https://openai.com/index/introducing-o3-and-o4-mini/",
            "assumption": "same family/date as o3-high",
        },
        {
            "model": "o3-low",
            "family": "o3",
            "release_date": "2025-04-16",
            "source_url": "https://openai.com/index/introducing-o3-and-o4-mini/",
            "assumption": "same family/date as o3-high",
        },
        {
            "model": "o4-mini-high",
            "family": "o4-mini",
            "release_date": "2025-04-16",
            "source_url": "https://openai.com/index/introducing-o3-and-o4-mini/",
            "assumption": "o4-mini family launch date",
        },
        {
            "model": "gpt-5-high",
            "family": "GPT-5",
            "release_date": "2025-08-07",
            "source_url": "https://openai.com/index/introducing-gpt-5/",
            "assumption": "GPT-5 launch date",
        },
        {
            "model": "gpt-5-medium",
            "family": "GPT-5",
            "release_date": "2025-08-07",
            "source_url": "https://openai.com/index/introducing-gpt-5/",
            "assumption": "same family/date as gpt-5-high",
        },
        {
            "model": "gpt-5-low",
            "family": "GPT-5",
            "release_date": "2025-08-07",
            "source_url": "https://openai.com/index/introducing-gpt-5/",
            "assumption": "same family/date as gpt-5-high",
        },
        {
            "model": "gpt-5r-high-engprompt",
            "family": "GPT-5",
            "release_date": "2025-08-07",
            "source_url": "https://openai.com/index/introducing-gpt-5/",
            "assumption": "GDPval prompt/config variant, mapped to GPT-5 family launch date",
        },
        {
            "model": "gpt-5p2-high",
            "family": "GPT-5.2",
            "release_date": "2025-12-11",
            "source_url": "https://openai.com/index/gpt-5-2/",
            "assumption": "GPT-5.2 launch date",
        },
        # Anthropic
        {
            "model": "claude",
            "family": "Claude Opus 4.1",
            "release_date": "2025-08-05",
            "source_url": "https://docs.anthropic.com/en/release-notes/api",
            "assumption": "release notes entry date for Opus 4.1",
        },
        {
            "model": "claude-sonnet-45",
            "family": "Claude Sonnet 4.5",
            "release_date": "2025-09-29",
            "source_url": "https://www.anthropic.com/news/claude-sonnet-4-5",
            "assumption": "announcement date",
        },
        {
            "model": "claude-45",
            "family": "Claude Opus 4.5",
            "release_date": "2025-11-24",
            "source_url": "https://www.anthropic.com/news/claude-opus-4-5",
            "assumption": "announcement date",
        },
        # Google
        {
            "model": "gemini",
            "family": "Gemini 2.5 Pro",
            "release_date": "2025-03-25",
            "source_url": "https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/",
            "assumption": "first public 2.5 Pro release date",
        },
        {
            "model": "gemini-3",
            "family": "Gemini 3",
            "release_date": "2025-11-18",
            "source_url": "https://blog.google/technology/google-deepmind/gemini-3/",
            "assumption": "Gemini 3 announcement date",
        },
        # xAI
        {
            "model": "grok",
            "family": "Grok 4",
            "release_date": "2025-07-09",
            "source_url": "https://x.ai/news/grok-4",
            "assumption": "announcement date",
        },
    ]
    out = pd.DataFrame(rows)
    out["release_date"] = pd.to_datetime(out["release_date"])
    return out


def estimate_growth(series: pd.Series, x_months: pd.Series) -> GrowthEst:
    y = series.astype(float).to_numpy()
    x = x_months.astype(float).to_numpy()
    if len(y) < 2:
        raise ValueError("Need at least 2 points for growth estimate")

    x_span = float(x[-1] - x[0])
    if x_span <= 0:
        raise ValueError("Non-positive month span")
    cagr = float((y[-1] / y[0]) ** (1.0 / x_span) - 1.0)

    # log-linear regression slope -> monthly growth
    b1, _ = np.polyfit(x, np.log(np.clip(y, 1e-12, None)), 1)
    log_reg = float(np.exp(b1) - 1.0)

    return GrowthEst(
        monthly_cagr=cagr,
        monthly_log_reg=log_reg,
        annualized_from_cagr=float((1.0 + cagr) ** 12 - 1.0),
        annualized_from_log_reg=float((1.0 + log_reg) ** 12 - 1.0),
    )


def estimate_abs_growth_pp(series: pd.Series, x_months: pd.Series) -> AbsGrowthEst:
    y = series.astype(float).to_numpy()
    x = x_months.astype(float).to_numpy()
    if len(y) < 3:
        raise ValueError("Need at least 3 points for absolute growth estimate")

    d = np.diff(y) * 100.0  # percentage points per month on adjacent grid
    mean_pp = float(np.mean(d))
    median_pp = float(np.median(d))

    b1, _ = np.polyfit(x, y, 1)
    ols_pp = float(b1 * 100.0)

    slopes = []
    n = len(y)
    for i in range(n):
        for j in range(i + 1, n):
            dx = x[j] - x[i]
            if dx > 0:
                slopes.append((y[j] - y[i]) / dx)
    theilsen_pp = float(np.median(slopes) * 100.0)
    return AbsGrowthEst(
        mean_pp_per_month=mean_pp,
        median_pp_per_month=median_pp,
        ols_pp_per_month=ols_pp,
        theilsen_pp_per_month=theilsen_pp,
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if not EXPOSURE_TS_PATH.exists():
        raise FileNotFoundError(f"Missing exposure timeseries: {EXPOSURE_TS_PATH}")
    if not RISK_MODEL_PATH.exists():
        raise FileNotFoundError(f"Missing model risk table: {RISK_MODEL_PATH}")

    # 1) Exposure trend (annual -> monthly growth)
    ind = pd.read_csv(EXPOSURE_TS_PATH)
    exp_year = (
        ind.groupby("year", as_index=False)
        .agg(total_emp=("total_emp", "sum"), exposure_emp=("exposed_emp", "sum"))
        .assign(national_exposure=lambda x: x["exposure_emp"] / x["total_emp"])
        .sort_values("year")
    )
    base_year = int(exp_year["year"].min())
    exp_year["months_since_base"] = (exp_year["year"] - base_year) * 12
    exp_growth = estimate_growth(exp_year["national_exposure"], exp_year["months_since_base"])

    # exposure log-trend model for interpolation
    be, ae = np.polyfit(exp_year["months_since_base"], np.log(exp_year["national_exposure"]), 1)

    # 2) Capability trend (frontier win_rate by model release date)
    model_risk = pd.read_csv(RISK_MODEL_PATH)
    current_risk = float(
        model_risk.sort_values("national_replacement_risk_emp_weighted", ascending=False)
        .iloc[0]["national_replacement_risk_emp_weighted"]
    )
    release_ref = model_release_reference()
    timeline = model_risk.merge(release_ref, on="model", how="left")
    missing = timeline[timeline["release_date"].isna()]["model"].tolist()
    if missing:
        raise ValueError(f"Missing release dates for models: {missing}")

    by_date = (
        timeline.groupby("release_date", as_index=False)
        .agg(max_win_rate=("model_global_win_rate", "max"))
        .sort_values("release_date")
    )
    by_date["frontier_win_rate"] = by_date["max_win_rate"].cummax()
    d0 = pd.to_datetime(by_date["release_date"].min())
    by_date["months_since_first_release"] = by_date["release_date"].apply(lambda d: month_diff(d0, pd.to_datetime(d)))
    win_growth = estimate_growth(by_date["frontier_win_rate"], by_date["months_since_first_release"])

    # 3) Combined risk trend on event dates
    # Interpolate exposure at model release dates using exposure log-trend.
    by_date["months_since_exp_base"] = by_date["release_date"].apply(
        lambda d: month_diff(pd.Timestamp(year=base_year, month=1, day=1), pd.to_datetime(d))
    )
    by_date["exposure_hat"] = np.exp(ae + be * by_date["months_since_exp_base"])
    by_date["risk_frontier"] = by_date["exposure_hat"] * by_date["frontier_win_rate"]
    risk_growth = estimate_growth(by_date["risk_frontier"], by_date["months_since_first_release"])

    # 4) Monthly grid series (more sequence points than sparse event dates)
    start_month = pd.Timestamp(year=d0.year, month=d0.month, day=1)
    end_d = pd.to_datetime(by_date["release_date"].max())
    end_month = pd.Timestamp(year=end_d.year, month=end_d.month, day=1)
    monthly = pd.DataFrame({"month_start": pd.date_range(start_month, end_month, freq="MS")})
    monthly["month_end"] = monthly["month_start"] + pd.offsets.MonthEnd(0)

    by_date_sorted = by_date[["release_date", "frontier_win_rate"]].sort_values("release_date").copy()
    monthly = pd.merge_asof(
        monthly.sort_values("month_end"),
        by_date_sorted,
        left_on="month_end",
        right_on="release_date",
        direction="backward",
    )
    monthly["frontier_win_rate"] = monthly["frontier_win_rate"].ffill()
    monthly["months_since_first_release"] = monthly["month_start"].apply(lambda d: month_diff(start_month, pd.to_datetime(d)))
    monthly["months_since_exp_base"] = monthly["month_start"].apply(
        lambda d: month_diff(pd.Timestamp(year=base_year, month=1, day=1), pd.to_datetime(d))
    )
    monthly["exposure_hat"] = np.exp(ae + be * monthly["months_since_exp_base"])
    monthly["risk_frontier_raw"] = monthly["exposure_hat"] * monthly["frontier_win_rate"]

    # Anchor monthly risk level to current computed risk (21.37%) for absolute-delta interpretability.
    scale = current_risk / float(monthly["risk_frontier_raw"].iloc[-1])
    monthly["risk_frontier"] = monthly["risk_frontier_raw"] * scale
    monthly["delta_pp"] = monthly["risk_frontier"].diff() * 100.0

    risk_growth_monthly = estimate_growth(monthly["risk_frontier"], monthly["months_since_first_release"])
    risk_abs_growth = estimate_abs_growth_pp(monthly["risk_frontier"], monthly["months_since_first_release"])

    # decomposition (CAGR-based)
    combined_from_parts = (1.0 + exp_growth.monthly_cagr) * (1.0 + win_growth.monthly_cagr) - 1.0

    current_risk_pct = float(monthly["risk_frontier"].iloc[-1] * 100.0)
    prev_risk_pct = float(monthly["risk_frontier"].iloc[-2] * 100.0)
    start_risk_pct = float(monthly["risk_frontier"].iloc[0] * 100.0)
    next_delta_pp = float(current_risk_pct * risk_growth_monthly.monthly_cagr)

    # Save outputs
    release_ref.to_csv(OUT_DIR / "model_release_timeline_for_growth.csv", index=False)
    exp_year.to_csv(OUT_DIR / "national_exposure_timeseries_for_growth.csv", index=False)
    by_date.to_csv(OUT_DIR / "capability_and_risk_frontier_timeseries.csv", index=False)
    monthly.to_csv(OUT_DIR / "risk_frontier_monthly_series.csv", index=False)

    summary = {
        "exposure_growth": exp_growth.__dict__,
        "win_rate_growth_frontier": win_growth.__dict__,
        "risk_growth_frontier_event_points": risk_growth.__dict__,
        "risk_growth_frontier_monthly": risk_growth_monthly.__dict__,
        "risk_abs_increment_frontier_monthly_pp": risk_abs_growth.__dict__,
        "risk_growth_from_multiplicative_decomposition_monthly_cagr": combined_from_parts,
        "level_anchor": {
            "current_risk_from_main_pipeline": current_risk,
            "monthly_series_scale_factor": scale,
        },
        "levels": {
            "start_risk_pct": start_risk_pct,
            "previous_month_risk_pct": prev_risk_pct,
            "current_risk_pct": current_risk_pct,
            "next_month_expected_delta_pp_from_cagr": next_delta_pp,
        },
        "window": {
            "exposure_start_year": int(exp_year["year"].min()),
            "exposure_end_year": int(exp_year["year"].max()),
            "win_start_date": str(by_date["release_date"].min().date()),
            "win_end_date": str(by_date["release_date"].max().date()),
            "win_month_span": int(by_date["months_since_first_release"].max() - by_date["months_since_first_release"].min()),
            "monthly_points": int(len(monthly)),
        },
    }
    with open(OUT_DIR / "monthly_risk_growth_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    # Markdown report
    lines: List[str] = []
    lines.append("# AI替代风险月度增速估计（任务级对齐口径）")
    lines.append("")
    lines.append("- 口径：`Risk = Exposure × WinRate`（仅 `win_rate`，不计 tie）")
    lines.append("- 暴露度时间序列：BLS/O*NET 2019-2024（年度）")
    lines.append("- 能力时间序列：GDPval 模型胜率 + 模型发布日期")
    lines.append(f"- 月度序列点数：`{len(monthly)}`（{start_month.date()} 到 {end_month.date()}，按月）")
    lines.append("- 为了和主结果 `21.37%` 对齐，月度风险序列已做水平锚定（不改变增速）。")
    lines.append("")
    lines.append("## 核心结论")
    lines.append("")
    lines.append(
        f"- 暴露度月增速：`{exp_growth.monthly_cagr:.4%}`（CAGR），`{exp_growth.monthly_log_reg:.4%}`（log回归）"
    )
    lines.append(
        f"- WinRate月增速（frontier）：`{win_growth.monthly_cagr:.4%}`（CAGR），`{win_growth.monthly_log_reg:.4%}`（log回归）"
    )
    lines.append(
        f"- AI替代风险月增速（frontier, 月度序列）：`{risk_growth_monthly.monthly_cagr:.4%}`（CAGR），`{risk_growth_monthly.monthly_log_reg:.4%}`（log回归）"
    )
    lines.append(
        f"- 乘法分解校验：`(1+g_exposure)*(1+g_win)-1 = {combined_from_parts:.4%}`（与直接风险CAGR接近）"
    )
    lines.append(
        f"- 绝对月增量（百分点）：均值 `{risk_abs_growth.mean_pp_per_month:.3f}`，中位数 `{risk_abs_growth.median_pp_per_month:.3f}`，"
        f"OLS斜率 `{risk_abs_growth.ols_pp_per_month:.3f}`，Theil-Sen `{risk_abs_growth.theilsen_pp_per_month:.3f}`"
    )
    lines.append(
        f"- 水平解读：起点 `{start_risk_pct:.2f}%`，上月 `{prev_risk_pct:.2f}%`，当前 `{current_risk_pct:.2f}%`，"
        f"按CAGR推算下月约 `+{next_delta_pp:.2f}` 个百分点"
    )
    lines.append("")
    lines.append("## 暴露度时间序列（全国就业加权）")
    lines.append("")
    lines.append("| 年份 | 全国暴露度 |")
    lines.append("|---|---:|")
    for _, r in exp_year.iterrows():
        lines.append(f"| {int(r['year'])} | {r['national_exposure']:.6f} |")
    lines.append("")
    lines.append("## 能力/风险前沿时间序列（按发布日期）")
    lines.append("")
    lines.append("| 日期 | Frontier WinRate | 暴露度(插值) | Frontier Risk=E×W |")
    lines.append("|---|---:|---:|---:|")
    for _, r in by_date.iterrows():
        lines.append(
            f"| {pd.to_datetime(r['release_date']).date()} | {r['frontier_win_rate']:.6f} | "
            f"{r['exposure_hat']:.6f} | {r['risk_frontier']:.6f} |"
        )
    lines.append("")
    lines.append("## 风险月度序列（用于绝对增量估计）")
    lines.append("")
    lines.append("| 月份 | Frontier WinRate | 暴露度(插值) | 风险(锚定后) | 单月绝对增量(百分点) |")
    lines.append("|---|---:|---:|---:|---:|")
    for _, r in monthly.iterrows():
        delta_txt = "" if pd.isna(r["delta_pp"]) else f"{r['delta_pp']:.3f}"
        lines.append(
            f"| {pd.to_datetime(r['month_start']).date()} | {r['frontier_win_rate']:.6f} | {r['exposure_hat']:.6f} | "
            f"{r['risk_frontier']:.6f} | {delta_txt} |"
        )
    lines.append("")
    lines.append("## 发布日期映射来源（官方）")
    lines.append("")
    lines.append("| 模型 | 家族 | 发布日 | 来源 | 备注 |")
    lines.append("|---|---|---|---|---|")
    for _, r in release_ref.sort_values(["release_date", "model"]).iterrows():
        lines.append(
            f"| {r['model']} | {r['family']} | {pd.to_datetime(r['release_date']).date()} | {r['source_url']} | {r['assumption']} |"
        )
    lines.append("")
    lines.append("## 结果文件")
    lines.append("")
    lines.append("- `output/model_release_timeline_for_growth.csv`")
    lines.append("- `output/national_exposure_timeseries_for_growth.csv`")
    lines.append("- `output/capability_and_risk_frontier_timeseries.csv`")
    lines.append("- `output/risk_frontier_monthly_series.csv`")
    lines.append("- `output/monthly_risk_growth_summary.json`")

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Done. Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
