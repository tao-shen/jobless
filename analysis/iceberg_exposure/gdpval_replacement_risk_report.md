# GDPval × 暴露度：AI替代风险概率

- 年份: 2024
- 定义: `AI替代风险概率 = 行业暴露度 × AI胜出概率(win_rate)`
- 基准模型（按win_rate最高）: `gpt-5p2-high`

## 总概率（按行业人数加权）

| 模型 | GDPval总胜率 | GDPval总胜或平率 | 全国暴露度(就业加权) | 全国替代风险概率(就业加权, 仅胜出) |
|---|---:|---:|---:|---:|
| gpt-5p2-high | 0.4975 | 0.7086 | 0.4349 | 0.2190 |
| claude-45 | 0.4551 | 0.5960 | 0.4349 | 0.1944 |
| claude | 0.4359 | 0.4758 | 0.4349 | 0.1907 |
| claude-sonnet-45 | 0.4253 | 0.5025 | 0.4349 | 0.1816 |
| gemini-3 | 0.4025 | 0.5354 | 0.4349 | 0.1723 |
| gpt-5-high | 0.3481 | 0.3800 | 0.4349 | 0.1515 |
| gpt-5r-high-engprompt | 0.3298 | 0.3647 | 0.4349 | 0.1486 |
| o3-high | 0.3078 | 0.3406 | 0.4349 | 0.1321 |
| o4-mini-high | 0.2528 | 0.2783 | 0.4349 | 0.1082 |
| gemini | 0.2333 | 0.2545 | 0.4349 | 0.1012 |

## 各行业风险概率（基准模型 `gpt-5p2-high`，按行业人数加权贡献排序）

| 行业大类 | 就业人数 | 行业人数占比 | 暴露度 | AI胜出概率 | 替代风险概率 | 对全国总风险贡献 | 预计受影响就业人数 | AI胜率来源 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Health Care and Social Assistance (62) | 23,008,230 | 0.1634 | 0.3416 | 0.4711 | 0.1609 | 0.0263 | 3,703,002 | gdpval_sector |
| Accommodation and Food Services (72) | 14,213,040 | 0.1009 | 0.5127 | 0.4975 | 0.2551 | 0.0257 | 3,625,175 | gdpval_overall_fallback |
| Retail Trade (44-45) | 12,017,810 | 0.0853 | 0.4955 | 0.5556 | 0.2753 | 0.0235 | 3,308,006 | gdpval_sector |
| Government and Special Designation Sectors (99) | 10,049,250 | 0.0714 | 0.4574 | 0.6089 | 0.2785 | 0.0199 | 2,798,671 | gdpval_sector |
| Professional, Scientific, and Technical Services (54) | 10,664,090 | 0.0757 | 0.4822 | 0.4933 | 0.2379 | 0.0180 | 2,537,028 | gdpval_sector |
| Educational Services (61) | 13,604,430 | 0.0966 | 0.3506 | 0.4975 | 0.1744 | 0.0169 | 2,372,844 | gdpval_overall_fallback |
| Administrative and Support and Waste Management and Remediation Services (56) | 8,932,690 | 0.0634 | 0.4416 | 0.4975 | 0.2197 | 0.0139 | 1,962,181 | gdpval_overall_fallback |
| Construction (23) | 8,077,790 | 0.0574 | 0.4398 | 0.4975 | 0.2188 | 0.0126 | 1,767,266 | gdpval_overall_fallback |
| Transportation and Warehousing (48-49) | 7,319,250 | 0.0520 | 0.4731 | 0.4975 | 0.2353 | 0.0122 | 1,722,474 | gdpval_overall_fallback |
| Manufacturing (31-33) | 9,991,010 | 0.0710 | 0.3643 | 0.4622 | 0.1684 | 0.0119 | 1,682,472 | gdpval_sector |
| Finance and Insurance (52) | 4,199,210 | 0.0298 | 0.5444 | 0.4933 | 0.2686 | 0.0080 | 1,127,765 | gdpval_sector |
| Other Services (except Public Administration) (81) | 4,366,260 | 0.0310 | 0.4495 | 0.4975 | 0.2236 | 0.0069 | 976,323 | gdpval_overall_fallback |
| Management of Companies and Enterprises (55) | 2,809,200 | 0.0199 | 0.4821 | 0.4975 | 0.2399 | 0.0048 | 673,805 | gdpval_overall_fallback |
| Wholesale Trade (42) | 2,523,400 | 0.0179 | 0.4415 | 0.5822 | 0.2570 | 0.0046 | 648,575 | gdpval_sector |
| Arts, Entertainment, and Recreation (71) | 2,601,640 | 0.0185 | 0.4707 | 0.4975 | 0.2342 | 0.0043 | 609,197 | gdpval_overall_fallback |
| Information (51) | 2,874,490 | 0.0204 | 0.4839 | 0.3822 | 0.1849 | 0.0038 | 531,620 | gdpval_sector |
| Real Estate and Rental and Leasing (53) | 2,004,380 | 0.0142 | 0.4796 | 0.4400 | 0.2110 | 0.0030 | 423,008 | gdpval_sector |
| Utilities (22) | 574,910 | 0.0041 | 0.4255 | 0.4975 | 0.2117 | 0.0009 | 121,696 | gdpval_overall_fallback |
| Agriculture, Forestry, Fishing and Hunting (11) | 419,600 | 0.0030 | 0.5804 | 0.4975 | 0.2887 | 0.0009 | 121,148 | gdpval_overall_fallback |
| Mining, Quarrying, and Oil and Gas Extraction (21) | 564,960 | 0.0040 | 0.4305 | 0.4975 | 0.2141 | 0.0009 | 120,986 | gdpval_overall_fallback |

## 说明

- GDPval有行业分项的行业，使用对应行业`win_rate`。
- 没有行业分项的行业，回退使用该模型GDPval总`win_rate`。
- 本版严格不计打平。
- 行业表中的“对全国总风险贡献”按`行业人数占比 × 行业替代风险概率`计算，求和即全国总概率。

## 输出文件

- `output/gdpval_model_totals.csv`
- `output/gdpval_model_sector_win_rates.csv`
- `output/industry_ai_replacement_risk_by_model_sector.csv`
- `output/overall_ai_replacement_probability_by_model.csv`
- `output/industry_ai_replacement_risk_top_model.csv`