# 任务暴露度（论文流程版，不用工资加权）

- 生成时间（UTC）: 2026-02-24 05:36:30
- 口径区间: 2019-2024
- 数据源:
  - O*NET 30.1: Task Statements / Task Ratings / Occupation Data
  - BLS OEWS: National industry-specific (`oesmYYin4`) + National occupation (`oesmYYnat`)
  - Tool ecosystem (论文能力映射对应): Zapier + OpenTools + MCP servers

## 方法

1. 任务需求强度（O*NET）
   - `w_t = Importance(IM)_norm × Prevalence(RT,FT)`
2. AI 工具能力映射（论文结构对应）
   - 构建工具语料（工具名+描述）
   - 用 TF-IDF 语义相似度把工具能力映射到 O*NET 任务文本
   - 得到任务可暴露度 `a_t`
3. 职业暴露度
   - `Exposure_occ = Σ(w_t × a_t) / Σ(w_t)`
4. 行业暴露度（不使用工资）
   - `Exposure_ind,year = Σ(emp_occ,ind,year × Exposure_occ) / Σ(emp_occ,ind,year)`
5. 增速
   - 同比 `YoY` + 复合增速 `CAGR`

## 打分细则（本次实现）

- 任务权重 `w_t`:
  - `importance_norm = (IM - 1) / 4`
  - `rt_norm = RT / 100`
  - `ft_norm = (E[FT] - 1) / 6`，其中 `E[FT]` 为 FT 分布的期望
  - `prevalence = 0.5 * rt_norm + 0.5 * ft_norm`（缺失值用可用项）
  - `w_t = max(importance_norm * prevalence, 0.01)`
- 任务可暴露度 `a_t`:
  - 用 TF-IDF + cosine 计算任务文本与工具文本最大相似度 `sim_t`
  - `a_t = clip((sim_t - p10)/(p90 - p10), 0, 1)`，再设下限 0.02
- 职业暴露度:
  - `Exposure_occ = Σ(w_t * a_t) / Σ(w_t)`
- 行业暴露度（不含工资）:
  - `Exposure_ind,year = Σ(emp_occ,ind,year * Exposure_occ) / Σ(emp_occ,ind,year)`
- 增速:
  - `YoY = Exposure_y / Exposure_(y-1) - 1`
  - `CAGR = (Exposure_2024 / Exposure_2019)^(1/5) - 1`

## 论文原始打分 vs 本次实现

- 论文（原文）:
  - 职业分数由“技能重要性 × 可自动化程度 × 普及度”聚合而成。
  - 工具能力矩阵来自 13k+ 工具（MCP/Zapier/OpenTools），用 LLM in-context 映射到 BLS 技能分类，并做人工复核。
  - 经济聚合层包含工资与就业价值。
- 本次实现:
  - 保持同一结构：任务权重 × AI能力映射 × 职业/行业聚合。
  - 差异在能力映射：使用公开工具目录 + 文本相似度，不是论文的 LLM+人工复核 capability matrix。
  - 按你的要求，去掉工资权重，仅用任务与就业。

## 工具能力矩阵样本规模

- 总工具数: 18,794
- mcp_servers: 1,387
- opentools: 8,574
- zapier: 8,833

## 总体结果

- 全国任务暴露度（就业加权）: 0.4196 (2019) → 0.4367 (2024)
- 全国任务暴露度 CAGR(2019-2024): 0.81%

## 暴露度最高的职业（Top 20，2024）

| SOC | 职业 | 任务暴露度 |
|---|---|---:|
| 43-5052 | Postal Service Mail Carriers | 0.7875 |
| 27-2091 | Disc Jockeys, Except Radio | 0.7729 |
| 51-5112 | Printing Press Operators | 0.7728 |
| 43-4131 | Loan Interviewers and Clerks | 0.7577 |
| 19-3022 | Survey Researchers | 0.7491 |
| 45-2092 | Farmworkers and Laborers, Crop, Nursery, and Greenhouse | 0.7430 |
| 43-6012 | Legal Secretaries and Administrative Assistants | 0.7405 |
| 27-2031 | Dancers | 0.7403 |
| 35-3011 | Bartenders | 0.7213 |
| 31-9094 | Medical Transcriptionists | 0.7116 |
| 41-9012 | Models | 0.7023 |
| 43-9022 | Word Processors and Typists | 0.7012 |
| 13-1082 | Project Management Specialists | 0.7010 |
| 41-3031 | Securities, Commodities, and Financial Services Sales Agents | 0.7009 |
| 43-9041 | Insurance Claims and Policy Processing Clerks | 0.6979 |
| 13-2099 | Financial Specialists, All Other | 0.6971 |
| 13-2081 | Tax Examiners and Collectors, and Revenue Agents | 0.6943 |
| 53-1041 | Aircraft Cargo Handling Supervisors | 0.6902 |
| 51-8031 | Water and Wastewater Treatment Plant and System Operators | 0.6896 |
| 13-2023 | Appraisers and Assessors of Real Estate | 0.6886 |

## 暴露度最高的行业（NAICS 4-digit，Top 20，2024）

| NAICS | 行业 | 任务暴露度 |
|---|---|---:|
| 491100 | Postal Service (Federal Government) | 0.6691 |
| 115100 | Support Activities for Crop Production | 0.6090 |
| 523000 | Securities, Commodity Contracts, and Other Financial Investments and Related Activities | 0.5864 |
| 541200 | Accounting, Tax Preparation, Bookkeeping, and Payroll Services | 0.5861 |
| 722400 | Drinking Places (Alcoholic Beverages) | 0.5845 |
| 459300 | Florists | 0.5746 |
| 457100 | Gasoline Stations | 0.5670 |
| 522200 | Nondepository Credit Intermediation | 0.5538 |
| 445300 | Beer, Wine, and Liquor Retailers | 0.5483 |
| 516100 | Radio and Television Broadcasting Stations | 0.5442 |
| 524200 | Agencies, Brokerages, and Other Insurance Related Activities | 0.5359 |
| 525900 | Other Investment Pools and Funds | 0.5336 |
| 492200 | Local Messengers and Local Delivery | 0.5306 |
| 541100 | Legal Services | 0.5232 |
| 711400 | Agents and Managers for Artists, Athletes, Entertainers, and Other Public Figures | 0.5165 |
| 722500 | Restaurants and Other Eating Places | 0.5163 |
| 525100 | Insurance and Employee Benefit Funds | 0.5158 |
| 444200 | Lawn and Garden Equipment and Supplies Retailers | 0.5150 |
| 812100 | Personal Care Services | 0.5143 |
| 524100 | Insurance Carriers | 0.5141 |

## 暴露度最高的行业大类（2024）

| 行业大类 | 任务暴露度 |
|---|---:|
| Agriculture, Forestry, Fishing and Hunting (11) | 0.5804 |
| Finance and Insurance (52) | 0.5444 |
| Accommodation and Food Services (72) | 0.5127 |
| Retail Trade (44-45) | 0.4955 |
| Information (51) | 0.4839 |
| Professional, Scientific, and Technical Services (54) | 0.4822 |
| Management of Companies and Enterprises (55) | 0.4821 |
| Real Estate and Rental and Leasing (53) | 0.4796 |
| Transportation and Warehousing (48-49) | 0.4731 |
| Arts, Entertainment, and Recreation (71) | 0.4707 |
| Government and Special Designation Sectors (99) | 0.4574 |
| Other Services (except Public Administration) (81) | 0.4495 |
| Administrative and Support and Waste Management and Remediation Services (56) | 0.4416 |
| Wholesale Trade (42) | 0.4415 |
| Construction (23) | 0.4398 |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 0.4305 |
| Utilities (22) | 0.4255 |
| Manufacturing (31-33) | 0.3643 |
| Educational Services (61) | 0.3506 |
| Health Care and Social Assistance (62) | 0.3416 |

## 行业暴露度增速最快（按大类 CAGR，2019-2024）

| 行业大类 | 暴露度CAGR | 暴露度同比(2023-2024) |
|---|---:|---:|
| Management of Companies and Enterprises (55) | 2.93% | -0.23% |
| Information (51) | 2.91% | -0.43% |
| Professional, Scientific, and Technical Services (54) | 2.46% | 0.02% |
| Government and Special Designation Sectors (99) | 1.70% | -0.36% |
| Finance and Insurance (52) | 1.67% | -0.47% |
| Educational Services (61) | 1.42% | 0.44% |
| Utilities (22) | 1.30% | 0.49% |
| Transportation and Warehousing (48-49) | 1.08% | -0.36% |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 0.96% | -0.08% |
| Real Estate and Rental and Leasing (53) | 0.67% | 0.11% |
| Manufacturing (31-33) | 0.66% | -0.17% |
| Construction (23) | 0.66% | 0.14% |
| Health Care and Social Assistance (62) | 0.65% | -0.82% |
| Administrative and Support and Waste Management and Remediation Services (56) | 0.59% | -0.30% |
| Other Services (except Public Administration) (81) | 0.51% | -0.19% |

## 暴露任务就业量增速最快职业（Top 20，2019-2024）

| SOC | 职业 | 暴露任务就业量CAGR | 暴露任务就业量同比(2023-2024) |
|---|---|---:|---:|
| 29-2053 | Psychiatric Technicians | 11.68% | 17.56% |
| 19-4071 | Forest and Conservation Technicians | 10.27% | 8.14% |
| 11-3071 | Transportation, Storage, and Distribution Managers | 10.04% | 7.15% |
| 29-1129 | Therapists, All Other | 9.68% | 17.16% |
| 53-2022 | Airfield Operations Specialists | 9.27% | -9.17% |
| 29-1171 | Nurse Practitioners | 8.91% | 9.73% |
| 19-5012 | Occupational Health and Safety Technicians | 8.85% | 15.33% |
| 47-2042 | Floor Layers, Except Carpet, Wood, and Hard Tiles | 8.81% | -1.19% |
| 11-2022 | Sales Managers | 8.44% | 4.83% |
| 29-1216 | General Internal Medicine Physicians | 8.36% | -0.85% |
| 11-1021 | General and Operations Managers | 8.35% | 2.18% |
| 11-9121 | Natural Sciences Managers | 8.30% | 4.51% |
| 19-1029 | Biological Scientists, All Other | 8.29% | -2.47% |
| 11-3021 | Computer and Information Systems Managers | 8.28% | 9.01% |
| 51-9011 | Chemical Equipment Operators and Tenders | 7.90% | 5.95% |
| 11-2021 | Marketing Managers | 7.86% | 4.35% |
| 13-1071 | Human Resources Specialists | 7.70% | 2.40% |
| 29-1221 | Pediatricians, General | 7.63% | 23.20% |
| 11-9111 | Medical and Health Services Managers | 7.46% | 9.85% |
| 15-1212 | Information Security Analysts | 7.40% | 2.33% |

## 结果文件

- `output/tool_corpus_all.csv`
- `output/task_tool_mapping_sample.csv`
- `output/occupation_task_exposure.csv`
- `output/industry_exposure_by_year_naics4.csv`
- `output/industry_exposure_growth_naics4.csv`
- `output/industry_exposure_by_year_sector.csv`
- `output/industry_exposure_growth_sector.csv`
- `output/occupation_exposure_timeseries.csv`
- `output/occupation_exposed_employment_growth.csv`

## 与论文的差异

- 一致: 采用“任务需求 × AI能力映射 × 聚合”的结构。
- 差异: 论文使用 LLM+人工复核构建 capability matrix；此处用公开工具目录+文本相似度复现。
- 已满足你的约束: 全流程不使用工资权重，仅用任务与就业。
