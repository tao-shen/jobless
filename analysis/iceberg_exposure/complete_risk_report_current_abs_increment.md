# AI替代风险完整报告（当前指标 + 绝对月增量 + 各行业）

- 口径：`Risk = Exposure × WinRate`（仅 `win_rate`，不计 tie）
- 暴露度：来自 O*NET/BLS（2019-2024）时间序列
- 能力：来自 GDPval（按模型发布日期构建 frontier 序列）
- 当前模型基准：`gpt-5p2-high`

## 当前总指标（全国）

- 当前全国风险：`21.37%`
- 当前全国暴露度：`43.64%`
- 当前frontier win_rate：`49.75%`
- 上月全国风险：`19.53%`
- 本月全国风险：`21.37%`
- 最近一个月绝对增量：`+1.84` 个百分点
- 历史平均绝对增量（20个月序列）：`+0.90` 个百分点/月
- 趋势绝对增量（OLS）：`+1.03` 个百分点/月
- 稳健中位绝对增量：`+0.01` 个百分点/月

## 当前指标计算框架图

```mermaid
flowchart TD
    A[输入数据] --> A1[职业暴露度 E_occ]
    A --> A2[职业能力概率 P_win_occ]
    A --> A3[BLS IN4 行业-职业就业 emp(ind,occ)]

    A1 --> B1[职业风险 Risk_occ = E_occ * P_win_occ]
    A2 --> B1

    B1 --> C1[行业风险 Risk_ind = Σ_occ(emp*Risk_occ)/Σ_occ(emp)]
    A3 --> C1

    A1 --> C2[行业暴露 Exposure_ind = Σ_occ(emp*E_occ)/Σ_occ(emp)]
    A3 --> C2
    B1 --> C3[行业有效Win Win_ind = Risk_ind / Exposure_ind]

    C1 --> D1[全国当前风险 Risk_nat = Σ_ind(emp_ind*Risk_ind)/Σ_ind(emp_ind)]
    C2 --> D2[全国当前暴露 Exposure_nat = Σ_ind(emp_ind*Exposure_ind)/Σ_ind(emp_ind)]
    A2 --> D3[全国当前frontier Win = 模型全局 win_rate]
```

## 各行业当前指标与绝对月增量（估计）

| 行业 | 当前风险(%) | 当前暴露度(%) | 当前有效Win(%) | 估计当月绝对增量(百分点) | 历史平均绝对增量(百分点/月) | 就业人数 | 对全国风险贡献(百分点) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Agriculture, Forestry, Fishing and Hunting (11) | 28.51 | 58.06 | 49.10 | 2.50 | 1.20 | 419,600 | 0.08 |
| Finance and Insurance (52) | 27.86 | 54.71 | 50.92 | 2.52 | 1.18 | 4,199,210 | 0.83 |
| Retail Trade (44-45) | 27.32 | 49.77 | 54.89 | 2.41 | 1.15 | 12,017,810 | 2.33 |
| Information (51) | 26.13 | 48.99 | 53.34 | 2.40 | 1.12 | 2,874,490 | 0.53 |
| Accommodation and Food Services (72) | 25.17 | 51.23 | 49.12 | 2.23 | 1.06 | 14,213,040 | 2.54 |
| Wholesale Trade (42) | 23.45 | 45.41 | 51.64 | 2.09 | 0.99 | 2,523,400 | 0.42 |
| Transportation and Warehousing (48-49) | 23.14 | 47.26 | 48.97 | 2.08 | 0.98 | 7,319,250 | 1.20 |
| Arts, Entertainment, and Recreation (71) | 23.12 | 47.04 | 49.15 | 2.06 | 0.98 | 2,601,640 | 0.43 |
| Professional, Scientific, and Technical Services (54) | 23.07 | 48.78 | 47.30 | 2.11 | 0.98 | 10,664,090 | 1.75 |
| Management of Companies and Enterprises (55) | 22.99 | 48.13 | 47.76 | 2.11 | 0.98 | 2,809,200 | 0.46 |
| Real Estate and Rental and Leasing (53) | 22.90 | 48.37 | 47.35 | 2.05 | 0.97 | 2,004,380 | 0.33 |
| Government and Special Designation Sectors (99) | 22.21 | 45.97 | 48.31 | 2.01 | 0.94 | 10,049,250 | 1.58 |
| Administrative and Support and Waste Management and Remediation Services (56) | 21.89 | 43.84 | 49.92 | 1.96 | 0.93 | 8,932,690 | 1.39 |
| Other Services (except Public Administration) (81) | 21.81 | 44.82 | 48.66 | 1.95 | 0.92 | 4,366,260 | 0.68 |
| Construction (23) | 20.98 | 43.66 | 48.05 | 1.88 | 0.89 | 8,077,790 | 1.20 |
| Utilities (22) | 20.59 | 42.11 | 48.90 | 1.86 | 0.87 | 574,910 | 0.08 |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 20.20 | 42.95 | 47.02 | 1.81 | 0.86 | 564,960 | 0.08 |
| Manufacturing (31-33) | 17.75 | 36.75 | 48.31 | 1.59 | 0.75 | 9,991,010 | 1.26 |
| Educational Services (61) | 16.55 | 35.06 | 47.20 | 1.49 | 0.70 | 13,604,430 | 1.60 |
| Health Care and Social Assistance (62) | 15.88 | 34.50 | 46.02 | 1.42 | 0.67 | 23,008,230 | 2.59 |

## 绝对增量计算框架图

```mermaid
flowchart TD
    A[输入数据] --> A1[BLS/O*NET 年度暴露度 E_s(y)]
    A --> A2[GDPval 模型 win_rate + 发布日期]
    A --> A3[当前主结果行业风险 R_s(now)]

    A1 --> B1[按行业拟合暴露度月增速 gE_s]
    A2 --> B2[构造frontier能力月增速 gW]

    B1 --> C1[行业风险月增速 gR_s=(1+gE_s)*(1+gW)-1]
    B2 --> C1

    A3 --> C2[当前行业风险 R_s(now)]
    C1 --> D1[估计当月绝对增量 Δ_s(now)=R_s(now)*gR_s]
    C1 --> D2[回推起点 R_s(0)=R_s(now)/(1+gR_s)^T]
    D2 --> D3[历史平均绝对增量 (R_s(now)-R_s(0))/T]

    D1 --> E[输出行业绝对增量（百分点/月）]
    D3 --> E

    subgraph National
      N1[月度风险序列 R(m)] --> N2[OLS斜率 / 平均Δ / 中位Δ]
    end
```

## 关键公式

- 全国/行业风险：`Risk = Exposure × WinRate`
- 行业月增速：`gR_s = (1+gE_s)*(1+gW)-1`
- 行业当月绝对增量（百分点）：`Δ_s(now) = Risk_s(now) * gR_s * 100`
- 行业历史平均绝对增量（百分点/月）：`(Risk_s(now)-Risk_s(0))/T * 100`

## 输出文件

- `output/industry_absolute_increment_estimate.csv`
- `output/risk_frontier_monthly_series.csv`
- `output/monthly_risk_growth_summary.json`
- `output/industry_ai_replacement_risk_top_model_task_aligned.csv`
- `output/overall_ai_replacement_probability_by_model_task_aligned.csv`