#!/usr/bin/env python3
"""Build complete report: current metrics + absolute monthly increment + industry view."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output"
REPORT_PATH = ROOT / "complete_risk_report_current_abs_increment.md"


def main() -> None:
    overall_path = OUT_DIR / "overall_ai_replacement_probability_by_model_task_aligned.csv"
    industry_path = OUT_DIR / "industry_ai_replacement_risk_top_model_task_aligned.csv"
    exposure_ts_path = OUT_DIR / "industry_exposure_by_year_sector.csv"
    monthly_path = OUT_DIR / "risk_frontier_monthly_series.csv"
    growth_sum_path = OUT_DIR / "monthly_risk_growth_summary.json"

    for p in [overall_path, industry_path, exposure_ts_path, monthly_path, growth_sum_path]:
        if not p.exists():
            raise FileNotFoundError(f"Missing required file: {p}")

    overall = pd.read_csv(overall_path)
    industry = pd.read_csv(industry_path)
    exposure_ts = pd.read_csv(exposure_ts_path)
    monthly = pd.read_csv(monthly_path)
    summary = json.loads(growth_sum_path.read_text(encoding="utf-8"))

    best = overall.sort_values("national_replacement_risk_emp_weighted", ascending=False).iloc[0]
    best_model = str(best["model"])
    national_risk_pct = float(best["national_replacement_risk_emp_weighted"] * 100.0)
    national_exp_pct = float(best["national_exposure_emp_weighted"] * 100.0)
    national_win_pct = float(best["model_global_win_rate"] * 100.0)

    gw = float(summary["win_rate_growth_frontier"]["monthly_cagr"])
    span_months = int(summary["window"]["win_month_span"])

    # National absolute increment from monthly sequence (more points, not endpoint-only).
    y = monthly["risk_frontier"].astype(float).to_numpy()
    x = np.arange(len(y), dtype=float)
    ols_slope_pp = float(np.polyfit(x, y, 1)[0] * 100.0)
    avg_delta_pp = float(np.nanmean(monthly["delta_pp"].astype(float)))
    median_delta_pp = float(np.nanmedian(monthly["delta_pp"].astype(float)))
    last_delta_pp = float(monthly["delta_pp"].iloc[-1])
    prev_risk_pct = float(monthly["risk_frontier"].iloc[-2] * 100.0)
    now_risk_pct = float(monthly["risk_frontier"].iloc[-1] * 100.0)

    # Industry-level absolute increment estimate.
    rows: List[Dict] = []
    for _, r in industry.iterrows():
        code = str(r["sector_code"])
        ts = exposure_ts[exposure_ts["sector_code"].astype(str) == code].sort_values("year")
        if ts.empty:
            continue

        m = (ts["year"] - ts["year"].min()) * 12
        log_e = np.log(ts["industry_exposure"].clip(lower=1e-9))
        b, _ = np.polyfit(m, log_e, 1)
        ge = float(np.exp(b) - 1.0)  # monthly exposure growth for sector
        gr = float((1.0 + ge) * (1.0 + gw) - 1.0)  # monthly risk growth for sector

        risk = float(r["replacement_risk_probability"])
        delta_now_pp = risk * gr * 100.0
        start_risk = risk / ((1.0 + gr) ** max(span_months, 1))
        avg_pp = (risk - start_risk) / max(span_months, 1) * 100.0

        rows.append(
            {
                "sector_code": code,
                "sector_title": str(r["sector_title"]),
                "total_emp": float(r["total_emp"]),
                "industry_exposure_pct": float(r["industry_exposure"] * 100.0),
                "effective_ai_win_pct": float(r["effective_ai_win_probability"] * 100.0),
                "current_risk_pct": risk * 100.0,
                "current_month_abs_increment_pp_est": delta_now_pp,
                "historical_avg_abs_increment_pp_est": avg_pp,
                "risk_growth_monthly_pct_est": gr * 100.0,
                "weighted_risk_contribution_pct_point": float(r["weighted_risk_contribution"] * 100.0),
            }
        )

    industry_inc = pd.DataFrame(rows).sort_values("current_risk_pct", ascending=False).reset_index(drop=True)
    industry_inc.to_csv(OUT_DIR / "industry_absolute_increment_estimate.csv", index=False)

    lines: List[str] = []
    lines.append("# AI替代风险完整报告（当前指标 + 绝对月增量 + 各行业）")
    lines.append("")
    lines.append("- 口径：`Risk = Exposure × WinRate`（仅 `win_rate`，不计 tie）")
    lines.append("- 暴露度：来自 O*NET/BLS（2019-2024）时间序列")
    lines.append("- 能力：来自 GDPval（按模型发布日期构建 frontier 序列）")
    lines.append("- 当前模型基准：`" + best_model + "`")
    lines.append("")
    lines.append("## 当前总指标（全国）")
    lines.append("")
    lines.append(f"- 当前全国风险：`{national_risk_pct:.2f}%`")
    lines.append(f"- 当前全国暴露度：`{national_exp_pct:.2f}%`")
    lines.append(f"- 当前frontier win_rate：`{national_win_pct:.2f}%`")
    lines.append(f"- 上月全国风险：`{prev_risk_pct:.2f}%`")
    lines.append(f"- 本月全国风险：`{now_risk_pct:.2f}%`")
    lines.append(f"- 最近一个月绝对增量：`+{last_delta_pp:.2f}` 个百分点")
    lines.append(f"- 历史平均绝对增量（20个月序列）：`+{avg_delta_pp:.2f}` 个百分点/月")
    lines.append(f"- 趋势绝对增量（OLS）：`+{ols_slope_pp:.2f}` 个百分点/月")
    lines.append(f"- 稳健中位绝对增量：`+{median_delta_pp:.2f}` 个百分点/月")
    lines.append("")
    lines.append("## 当前指标计算框架图")
    lines.append("")
    lines.append("```mermaid")
    lines.append("flowchart TD")
    lines.append("    A[输入数据] --> A1[职业暴露度 E_occ]")
    lines.append("    A --> A2[职业能力概率 P_win_occ]")
    lines.append("    A --> A3[BLS IN4 行业-职业就业 emp(ind,occ)]")
    lines.append("")
    lines.append("    A1 --> B1[职业风险 Risk_occ = E_occ * P_win_occ]")
    lines.append("    A2 --> B1")
    lines.append("")
    lines.append("    B1 --> C1[行业风险 Risk_ind = Σ_occ(emp*Risk_occ)/Σ_occ(emp)]")
    lines.append("    A3 --> C1")
    lines.append("")
    lines.append("    A1 --> C2[行业暴露 Exposure_ind = Σ_occ(emp*E_occ)/Σ_occ(emp)]")
    lines.append("    A3 --> C2")
    lines.append("    B1 --> C3[行业有效Win Win_ind = Risk_ind / Exposure_ind]")
    lines.append("")
    lines.append("    C1 --> D1[全国当前风险 Risk_nat = Σ_ind(emp_ind*Risk_ind)/Σ_ind(emp_ind)]")
    lines.append("    C2 --> D2[全国当前暴露 Exposure_nat = Σ_ind(emp_ind*Exposure_ind)/Σ_ind(emp_ind)]")
    lines.append("    A2 --> D3[全国当前frontier Win = 模型全局 win_rate]")
    lines.append("```")
    lines.append("")
    lines.append("## 各行业当前指标与绝对月增量（估计）")
    lines.append("")
    lines.append("| 行业 | 当前风险(%) | 当前暴露度(%) | 当前有效Win(%) | 估计当月绝对增量(百分点) | 历史平均绝对增量(百分点/月) | 就业人数 | 对全国风险贡献(百分点) |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|---:|")
    for _, r in industry_inc.iterrows():
        lines.append(
            f"| {r['sector_title']} ({r['sector_code']}) | {r['current_risk_pct']:.2f} | {r['industry_exposure_pct']:.2f} | "
            f"{r['effective_ai_win_pct']:.2f} | {r['current_month_abs_increment_pp_est']:.2f} | "
            f"{r['historical_avg_abs_increment_pp_est']:.2f} | {r['total_emp']:,.0f} | {r['weighted_risk_contribution_pct_point']:.2f} |"
        )
    lines.append("")
    lines.append("## 绝对增量计算框架图")
    lines.append("")
    lines.append("```mermaid")
    lines.append("flowchart TD")
    lines.append("    A[输入数据] --> A1[BLS/O*NET 年度暴露度 E_s(y)]")
    lines.append("    A --> A2[GDPval 模型 win_rate + 发布日期]")
    lines.append("    A --> A3[当前主结果行业风险 R_s(now)]")
    lines.append("")
    lines.append("    A1 --> B1[按行业拟合暴露度月增速 gE_s]")
    lines.append("    A2 --> B2[构造frontier能力月增速 gW]")
    lines.append("")
    lines.append("    B1 --> C1[行业风险月增速 gR_s=(1+gE_s)*(1+gW)-1]")
    lines.append("    B2 --> C1")
    lines.append("")
    lines.append("    A3 --> C2[当前行业风险 R_s(now)]")
    lines.append("    C1 --> D1[估计当月绝对增量 Δ_s(now)=R_s(now)*gR_s]")
    lines.append("    C1 --> D2[回推起点 R_s(0)=R_s(now)/(1+gR_s)^T]")
    lines.append("    D2 --> D3[历史平均绝对增量 (R_s(now)-R_s(0))/T]")
    lines.append("")
    lines.append("    D1 --> E[输出行业绝对增量（百分点/月）]")
    lines.append("    D3 --> E")
    lines.append("")
    lines.append("    subgraph National")
    lines.append("      N1[月度风险序列 R(m)] --> N2[OLS斜率 / 平均Δ / 中位Δ]")
    lines.append("    end")
    lines.append("```")
    lines.append("")
    lines.append("## 关键公式")
    lines.append("")
    lines.append("- 全国/行业风险：`Risk = Exposure × WinRate`")
    lines.append("- 行业月增速：`gR_s = (1+gE_s)*(1+gW)-1`")
    lines.append("- 行业当月绝对增量（百分点）：`Δ_s(now) = Risk_s(now) * gR_s * 100`")
    lines.append("- 行业历史平均绝对增量（百分点/月）：`(Risk_s(now)-Risk_s(0))/T * 100`")
    lines.append("")
    lines.append("## 输出文件")
    lines.append("")
    lines.append("- `output/industry_absolute_increment_estimate.csv`")
    lines.append("- `output/risk_frontier_monthly_series.csv`")
    lines.append("- `output/monthly_risk_growth_summary.json`")
    lines.append("- `output/industry_ai_replacement_risk_top_model_task_aligned.csv`")
    lines.append("- `output/overall_ai_replacement_probability_by_model_task_aligned.csv`")

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Done. Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
