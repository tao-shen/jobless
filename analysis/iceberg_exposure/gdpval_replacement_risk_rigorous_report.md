# GDPval × 暴露度（最严谨映射版，Win-only）

- 核心：不校准暴露度本体；只在职业层映射模型胜率，然后乘以暴露度。
- 风险定义：`risk_occ = exposure_occ × p_win_occ`，`p_win_occ` 仅用 `win_rate`。
- 聚合：按就业人数加权。

## 映射质量

- GDPval职业条目数: 44
- 成功映射到SOC: 43
- 未映射: 1
- 映射名称平均相似度: 1.0000
- 语义转移: k=5, sim_strength_q10=0.0250, sim_strength_q90=0.1334

## 全国总概率（按模型）

| 模型 | 全局Win率 | 全国暴露度(就业加权) | 全国替代风险概率(就业加权) |
|---|---:|---:|---:|
| gpt-5p2-high | 0.4975 | 0.4349 | 0.2123 |
| claude-45 | 0.4551 | 0.4349 | 0.1971 |
| claude | 0.4359 | 0.4349 | 0.1899 |
| claude-sonnet-45 | 0.4253 | 0.4349 | 0.1817 |
| gemini-3 | 0.4025 | 0.4349 | 0.1748 |
| gpt-5-high | 0.3481 | 0.4349 | 0.1505 |
| gpt-5r-high-engprompt | 0.3298 | 0.4349 | 0.1405 |
| o3-high | 0.3078 | 0.4349 | 0.1315 |
| o4-mini-high | 0.2528 | 0.4349 | 0.1098 |
| gemini | 0.2333 | 0.4349 | 0.0958 |
| grok | 0.2106 | 0.4349 | 0.0905 |
| gpt-5-medium | 0.1490 | 0.4349 | 0.0644 |

## 行业结果（最佳模型 `gpt-5p2-high`）

| 行业大类 | 就业人数 | 暴露度 | 有效Win率 | 风险概率 | 对全国总风险贡献 |
|---|---:|---:|---:|---:|---:|
| Health Care and Social Assistance (62) | 23,008,230 | 0.3416 | 0.4604 | 0.1573 | 0.0257 |
| Accommodation and Food Services (72) | 14,213,040 | 0.5127 | 0.4907 | 0.2516 | 0.0254 |
| Retail Trade (44-45) | 12,017,810 | 0.4955 | 0.5387 | 0.2669 | 0.0228 |
| Professional, Scientific, and Technical Services (54) | 10,664,090 | 0.4822 | 0.4748 | 0.2290 | 0.0173 |
| Educational Services (61) | 13,604,430 | 0.3506 | 0.4703 | 0.1649 | 0.0159 |
| Government and Special Designation Sectors (99) | 10,049,250 | 0.4574 | 0.4831 | 0.2209 | 0.0158 |
| Administrative and Support and Waste Management and Remediation Services (56) | 8,932,690 | 0.4416 | 0.4989 | 0.2203 | 0.0140 |
| Manufacturing (31-33) | 9,991,010 | 0.3643 | 0.4797 | 0.1748 | 0.0124 |
| Construction (23) | 8,077,790 | 0.4398 | 0.4798 | 0.2110 | 0.0121 |
| Transportation and Warehousing (48-49) | 7,319,250 | 0.4731 | 0.4868 | 0.2303 | 0.0120 |
| Finance and Insurance (52) | 4,199,210 | 0.5444 | 0.5085 | 0.2768 | 0.0083 |
| Other Services (except Public Administration) (81) | 4,366,260 | 0.4495 | 0.4857 | 0.2183 | 0.0068 |
| Information (51) | 2,874,490 | 0.4839 | 0.5342 | 0.2585 | 0.0053 |
| Management of Companies and Enterprises (55) | 2,809,200 | 0.4821 | 0.4736 | 0.2283 | 0.0046 |
| Arts, Entertainment, and Recreation (71) | 2,601,640 | 0.4707 | 0.4910 | 0.2311 | 0.0043 |
| Wholesale Trade (42) | 2,523,400 | 0.4415 | 0.5133 | 0.2266 | 0.0041 |
| Real Estate and Rental and Leasing (53) | 2,004,380 | 0.4796 | 0.4696 | 0.2252 | 0.0032 |
| Utilities (22) | 574,910 | 0.4255 | 0.4885 | 0.2079 | 0.0008 |
| Agriculture, Forestry, Fishing and Hunting (11) | 419,600 | 0.5804 | 0.4893 | 0.2840 | 0.0008 |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 564,960 | 0.4305 | 0.4683 | 0.2016 | 0.0008 |

## 输出文件

- `output/gdpval_occ_name_mapping_rigorous.csv`
- `output/occupation_win_probability_by_model_rigorous.csv`
- `output/overall_ai_replacement_probability_by_model_rigorous.csv`
- `output/industry_ai_replacement_risk_top_model_rigorous.csv`
- `output/rigorous_method_summary.json`