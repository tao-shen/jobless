# 严格暴露度（保守口径）

- 生成时间（UTC）: 2026-02-24 05:32:10
- 口径区间: 2019-2024
- 数据源: O*NET + BLS OEWS + 工具语料（Zapier/OpenTools/MCP）
- 约束: 不使用工资，仅任务与就业

## 严格规则

1. 仅纳入 O*NET `Core` 任务。
2. 任务暴露度必须同时满足：
   - 高相似度：top1 相似度进入高分位区间（P80以上）；
   - 多工具支持：top2/top3 相似度与 top1 一致；
   - 多来源支持：top3 工具来源越多越高。
3. 严格暴露度无最小保底分（不再设 0.02 下限）。

## 严格映射诊断

- 任务数量: Core 13,643 / 全部 18,796
- top1 相似度阈值: P80=0.2669, P95=0.3584
- top1 相似度均值: 0.2079
- 严格任务暴露度均值: 0.0645

## 全国暴露度

- 2019: 0.0661
- 2024: 0.0658
- CAGR(2019-2024): -0.09%

## 暴露度最高职业（Top 20，2024）

| SOC | 职业 | 严格暴露度 |
|---|---|---:|
| 43-3021 | Billing and Posting Clerks | 0.4009 |
| 53-1041 | Aircraft Cargo Handling Supervisors | 0.3858 |
| 19-3022 | Survey Researchers | 0.3772 |
| 43-5052 | Postal Service Mail Carriers | 0.3455 |
| 27-2031 | Dancers | 0.3161 |
| 41-3031 | Securities, Commodities, and Financial Services Sales Agents | 0.2704 |
| 27-4012 | Broadcast Technicians | 0.2688 |
| 25-3031 | Substitute Teachers, Short-Term | 0.2683 |
| 13-2099 | Financial Specialists, All Other | 0.2538 |
| 51-5112 | Printing Press Operators | 0.2339 |
| 45-2092 | Farmworkers and Laborers, Crop, Nursery, and Greenhouse | 0.2182 |
| 43-6012 | Legal Secretaries and Administrative Assistants | 0.2146 |
| 47-2151 | Pipelayers | 0.2129 |
| 13-2081 | Tax Examiners and Collectors, and Revenue Agents | 0.2126 |
| 39-3012 | Gambling and Sports Book Writers and Runners | 0.2112 |
| 53-2021 | Air Traffic Controllers | 0.2105 |
| 43-4131 | Loan Interviewers and Clerks | 0.2049 |
| 13-1031 | Claims Adjusters, Examiners, and Investigators | 0.2044 |
| 41-9091 | Door-to-Door Sales Workers, News and Street Vendors, and Related Workers | 0.2030 |
| 43-6013 | Medical Secretaries and Administrative Assistants | 0.2027 |

## 暴露度最高行业大类（2024）

| 行业大类 | 严格暴露度 |
|---|---:|
| Agriculture, Forestry, Fishing and Hunting (11) | 0.1284 |
| Accommodation and Food Services (72) | 0.1097 |
| Finance and Insurance (52) | 0.1042 |
| Retail Trade (44-45) | 0.0825 |
| Arts, Entertainment, and Recreation (71) | 0.0782 |
| Transportation and Warehousing (48-49) | 0.0720 |
| Management of Companies and Enterprises (55) | 0.0705 |
| Other Services (except Public Administration) (81) | 0.0678 |
| Real Estate and Rental and Leasing (53) | 0.0669 |
| Government and Special Designation Sectors (99) | 0.0668 |
| Professional, Scientific, and Technical Services (54) | 0.0645 |
| Information (51) | 0.0593 |
| Administrative and Support and Waste Management and Remediation Services (56) | 0.0558 |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 0.0525 |
| Health Care and Social Assistance (62) | 0.0511 |
| Educational Services (61) | 0.0509 |
| Wholesale Trade (42) | 0.0488 |
| Utilities (22) | 0.0466 |
| Construction (23) | 0.0458 |
| Manufacturing (31-33) | 0.0394 |

## 行业暴露度增速（大类，2019-2024）

| 行业大类 | 暴露度CAGR | 暴露度同比(2023-2024) |
|---|---:|---:|
| Government and Special Designation Sectors (99) | 1.40% | -0.91% |
| Utilities (22) | 1.16% | 1.25% |
| Management of Companies and Enterprises (55) | 0.96% | -0.78% |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 0.48% | -1.38% |
| Other Services (except Public Administration) (81) | 0.45% | -0.52% |
| Educational Services (61) | 0.42% | 1.26% |
| Real Estate and Rental and Leasing (53) | 0.40% | -1.89% |
| Arts, Entertainment, and Recreation (71) | 0.39% | -1.28% |
| Manufacturing (31-33) | 0.34% | -0.85% |
| Administrative and Support and Waste Management and Remediation Services (56) | 0.28% | -0.11% |
| Finance and Insurance (52) | 0.06% | -1.14% |
| Professional, Scientific, and Technical Services (54) | -0.02% | -0.67% |
| Transportation and Warehousing (48-49) | -0.10% | -0.58% |
| Health Care and Social Assistance (62) | -0.19% | -1.29% |
| Construction (23) | -0.42% | -0.52% |

## 输出文件

- `output/strict_task_tool_mapping.csv`
- `output/occupation_task_exposure_strict.csv`
- `output/industry_exposure_by_year_naics4_strict.csv`
- `output/industry_exposure_growth_naics4_strict.csv`
- `output/industry_exposure_by_year_sector_strict.csv`
- `output/industry_exposure_growth_sector_strict.csv`
- `output/national_exposure_strict.json`