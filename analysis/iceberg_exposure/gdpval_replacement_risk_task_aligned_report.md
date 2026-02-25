# GDPval × 暴露度（任务级对齐版，Win-only）

- 核心：先把 GDPval gold 任务映射到 O*NET 任务，再聚合成职业暴露度；然后与 GDPval 职业胜率相乘。
- 风险定义：`risk_occ = exposure_occ(task-aligned) × p_win_occ`，`p_win_occ` 仅用 `win_rate`。
- 行业与全国聚合：统一使用 IN4 2024 就业加权。

## 任务与职业映射质量

- GDPval 任务数: 220
- 成功任务对齐数: 220 (100.0%)
- GDPval 职业映射到 SOC 条目: 46
- 手工拆分映射职业数（按论文附录）: 1
- 任务 top-1 相似度均值: 0.2290
- 任务 top-1 相似度 P10/P90: 0.1559/0.3136

## 职业暴露度（任务级对齐后，Top 20）

| GDPval职业 | 对齐任务数 | 对齐暴露度(均值) | 暴露度标准差 | 相似度均值 |
|---|---:|---:|---:|---:|
| Real Estate Brokers | 5 | 0.8184 | 0.2095 | 0.3608 |
| Medical Secretaries and Administrative Assistants | 5 | 0.7711 | 0.0487 | 0.2335 |
| Personal Financial Advisors | 5 | 0.7692 | 0.0965 | 0.2272 |
| Securities, Commodities, and Financial Services Sales Agents | 5 | 0.7637 | 0.1464 | 0.2453 |
| Financial and Investment Analysts | 5 | 0.7155 | 0.1029 | 0.2615 |
| Administrative Services Managers | 5 | 0.6986 | 0.0614 | 0.2826 |
| News Analysts, Reporters, and Journalists | 5 | 0.6662 | 0.1161 | 0.2153 |
| Producers and Directors | 5 | 0.6585 | 0.0690 | 0.1644 |
| Computer and Information Systems Managers | 5 | 0.6441 | 0.1218 | 0.2336 |
| Private Detectives and Investigators | 5 | 0.6289 | 0.0685 | 0.2410 |
| Lawyers | 5 | 0.6285 | 0.0512 | 0.2526 |
| Accountants and Auditors | 5 | 0.6192 | 0.0222 | 0.2043 |
| Project Management Specialists | 5 | 0.6145 | 0.1701 | 0.2383 |
| Financial Managers | 5 | 0.6077 | 0.1539 | 0.2026 |
| Concierges | 5 | 0.6071 | 0.1790 | 0.2409 |
| Recreation Workers | 5 | 0.6020 | 0.1254 | 0.2185 |
| Film and Video Editors | 5 | 0.5999 | 0.0896 | 0.2203 |
| Real Estate Sales Agents | 5 | 0.5974 | 0.1293 | 0.2671 |
| Sales Representatives, Wholesale and Manufacturing, Except Technical and Scientific Products | 5 | 0.5918 | 0.1138 | 0.2540 |
| Counter and Rental Clerks | 5 | 0.5788 | 0.1259 | 0.2256 |

## 全国总概率（按模型）

| 模型 | 全局Win率 | 全国暴露度(就业加权) | 全国替代风险概率(就业加权) |
|---|---:|---:|---:|
| gpt-5p2-high | 0.4975 | 0.4364 | 0.2137 |
| claude-45 | 0.4551 | 0.4364 | 0.1995 |
| claude | 0.4359 | 0.4364 | 0.1909 |
| claude-sonnet-45 | 0.4253 | 0.4364 | 0.1817 |
| gemini-3 | 0.4025 | 0.4364 | 0.1739 |
| gpt-5-high | 0.3481 | 0.4364 | 0.1501 |
| gpt-5r-high-engprompt | 0.3298 | 0.4364 | 0.1414 |
| o3-high | 0.3078 | 0.4364 | 0.1314 |
| o4-mini-high | 0.2528 | 0.4364 | 0.1100 |
| gemini | 0.2333 | 0.4364 | 0.0969 |
| grok | 0.2106 | 0.4364 | 0.0902 |
| gpt-5-medium | 0.1490 | 0.4364 | 0.0647 |

## 行业结果（最佳模型 `gpt-5p2-high`）

| 行业大类 | 就业人数 | 暴露度 | 有效Win率 | 风险概率 | 对全国总风险贡献 |
|---|---:|---:|---:|---:|---:|
| Health Care and Social Assistance (62) | 23,008,230 | 0.3450 | 0.4602 | 0.1588 | 0.0259 |
| Accommodation and Food Services (72) | 14,213,040 | 0.5123 | 0.4912 | 0.2517 | 0.0254 |
| Retail Trade (44-45) | 12,017,810 | 0.4977 | 0.5489 | 0.2732 | 0.0233 |
| Professional, Scientific, and Technical Services (54) | 10,664,090 | 0.4878 | 0.4730 | 0.2307 | 0.0175 |
| Educational Services (61) | 13,604,430 | 0.3506 | 0.4720 | 0.1655 | 0.0160 |
| Government and Special Designation Sectors (99) | 10,049,250 | 0.4597 | 0.4831 | 0.2221 | 0.0158 |
| Administrative and Support and Waste Management and Remediation Services (56) | 8,932,690 | 0.4384 | 0.4992 | 0.2189 | 0.0139 |
| Manufacturing (31-33) | 9,991,010 | 0.3675 | 0.4831 | 0.1775 | 0.0126 |
| Construction (23) | 8,077,790 | 0.4366 | 0.4805 | 0.2098 | 0.0120 |
| Transportation and Warehousing (48-49) | 7,319,250 | 0.4726 | 0.4897 | 0.2314 | 0.0120 |
| Finance and Insurance (52) | 4,199,210 | 0.5471 | 0.5092 | 0.2786 | 0.0083 |
| Other Services (except Public Administration) (81) | 4,366,260 | 0.4482 | 0.4866 | 0.2181 | 0.0068 |
| Information (51) | 2,874,490 | 0.4899 | 0.5334 | 0.2613 | 0.0053 |
| Management of Companies and Enterprises (55) | 2,809,200 | 0.4813 | 0.4776 | 0.2299 | 0.0046 |
| Arts, Entertainment, and Recreation (71) | 2,601,640 | 0.4704 | 0.4915 | 0.2312 | 0.0043 |
| Wholesale Trade (42) | 2,523,400 | 0.4541 | 0.5164 | 0.2345 | 0.0042 |
| Real Estate and Rental and Leasing (53) | 2,004,380 | 0.4837 | 0.4735 | 0.2290 | 0.0033 |
| Agriculture, Forestry, Fishing and Hunting (11) | 419,600 | 0.5806 | 0.4910 | 0.2851 | 0.0008 |
| Utilities (22) | 574,910 | 0.4211 | 0.4890 | 0.2059 | 0.0008 |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 564,960 | 0.4295 | 0.4702 | 0.2020 | 0.0008 |

## 输出文件

- `output/onet_task_auto_full.csv`
- `output/gdpval_occ_soc_mapping_task_aligned.csv`
- `output/gdpval_task_level_alignment.csv`
- `output/gdpval_occupation_aligned_exposure.csv`
- `output/occupation_exposure_task_aligned.csv`
- `output/occupation_win_probability_by_model_task_aligned.csv`
- `output/overall_ai_replacement_probability_by_model_task_aligned.csv`
- `output/industry_ai_replacement_risk_top_model_task_aligned.csv`
- `output/task_aligned_method_summary.json`