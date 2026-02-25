# GDPval 原方法与任务级对齐可行性

## 1) GDPval 原文怎么做（与任务相关）

- GDPval 全集是 44 个职业、9 个行业、至少每职业 30 个任务（全文共 1,320 任务）；公开 gold subset 是每职业 5 个任务，共 220 任务。
- 每个任务由行业专家构建，包含 `request(+reference files)` 与 `deliverable`。
- 任务创建时，专家会把请求按 O*NET occupation task 做分类，以保证覆盖面。
- 主评测是“人类专家盲评 pairwise 比较”（win / tie / lose）；公开服务提供实验性自动 grader。
- 论文附录报告：gold subset 覆盖 208 个 O*NET tasks、25 个 skills、26 个 work activities。

来源：
- https://arxiv.org/abs/2510.04374
- https://arxiv.org/html/2510.04374
- https://openai.com/index/gdpval
- https://huggingface.co/datasets/openai/gdpval

## 2) 公开任务清单（gold subset）

- 任务数: **220**
- 职业数: **44**
- 行业数: **9**

| 行业 | 职业数 | 任务数 |
|---|---:|---:|
| Finance and Insurance | 5 | 25 |
| Government | 5 | 25 |
| Health Care and Social Assistance | 5 | 25 |
| Information | 5 | 25 |
| Manufacturing | 5 | 25 |
| Professional, Scientific, and Technical Services | 5 | 25 |
| Real Estate and Rental and Leasing | 5 | 25 |
| Retail Trade | 4 | 20 |
| Wholesale Trade | 5 | 25 |

### 各行业职业

- **Finance and Insurance**: Customer Service Representatives；Financial Managers；Financial and Investment Analysts；Personal Financial Advisors；Securities, Commodities, and Financial Services Sales Agents
- **Government**: Administrative Services Managers；Child, Family, and School Social Workers；Compliance Officers；First-Line Supervisors of Police and Detectives；Recreation Workers
- **Health Care and Social Assistance**: First-Line Supervisors of Office and Administrative Support Workers；Medical Secretaries and Administrative Assistants；Medical and Health Services Managers；Nurse Practitioners；Registered Nurses
- **Information**: Audio and Video Technicians；Editors；Film and Video Editors；News Analysts, Reporters, and Journalists；Producers and Directors
- **Manufacturing**: Buyers and Purchasing Agents；First-Line Supervisors of Production and Operating Workers；Industrial Engineers；Mechanical Engineers；Shipping, Receiving, and Inventory Clerks
- **Professional, Scientific, and Technical Services**: Accountants and Auditors；Computer and Information Systems Managers；Lawyers；Project Management Specialists；Software Developers
- **Real Estate and Rental and Leasing**: Concierges；Counter and Rental Clerks；Property, Real Estate, and Community Association Managers；Real Estate Brokers；Real Estate Sales Agents
- **Retail Trade**: First-Line Supervisors of Retail Sales Workers；General and Operations Managers；Pharmacists；Private Detectives and Investigators
- **Wholesale Trade**: First-Line Supervisors of Non-Retail Sales Workers；Order Clerks；Sales Managers；Sales Representatives, Wholesale and Manufacturing, Except Technical and Scientific Products；Sales Representatives, Wholesale and Manufacturing, Technical and Scientific Products

## 3) 能否在任务上对齐到 O*NET？

结论：**可以做“近似任务级对齐”**，但公开数据无法做到完全一一真值对齐。

原因：
- 公开数据有 220 条 prompt/rubric，但**没有公开每条任务对应的 O*NET task_id 标签**。
- leaderboard 公开的是按职业聚合后的 win_rate，不是每条任务的模型胜负明细。

我们做的可行性实证（同职业内语义匹配，TF-IDF top-1）：
- 自动职业映射：43/44 职业，任务对齐 215/220 (97.7%)。
- 按论文附录 A.7 对 `Buyers and Purchasing Agents` 做拆分映射（13-1021/13-1022/13-1023）后：**220/220 (100%)** 可对齐。
- 全量 220 任务相似度均值: 0.229；中位数: 0.217；P10/P90: 0.156/0.314
- 高相似（>=0.20）: 136/220；低相似（<0.08）: 1/220

说明：这说明任务级对齐在工程上可行，但属于“语义近似映射”，不是论文内部人工标注真值。

### 高相似示例（Top）

| 职业 | 相似度 | 匹配到的 O*NET 任务 |
|---|---:|---|
| First-Line Supervisors of Production and Operating Workers | 0.548 | Plan and establish work schedules, assignments, and production sequences to meet production goals. |
| Customer Service Representatives | 0.476 | Review insurance policy terms to determine whether a particular loss is covered by insurance. |
| Lawyers | 0.476 | Act as agent, trustee, guardian, or executor for businesses or individuals. |
| Administrative Services Managers | 0.421 | Supervise administrative staff and provide training and orientation to new staff. |
| Real Estate Brokers | 0.419 | Compare a property with similar properties that have recently sold to determine its competitive market price. |
| Counter and Rental Clerks | 0.415 | Prepare rental forms, obtaining customer signature and other information, such as required licenses. |
| Real Estate Brokers | 0.407 | Supervise agents who handle real estate transactions. |
| Real Estate Sales Agents | 0.387 | Rent or lease properties on behalf of clients. |

### 低相似示例（Bottom）

| 职业 | 相似度 | 匹配到的 O*NET 任务 |
|---|---:|---|
| Counter and Rental Clerks | 0.000 | Compute charges for merchandise or services and receive payments. |
| Mechanical Engineers | 0.112 | Select or install combined heat units, power units, cogeneration equipment, or trigeneration equipment that reduces energy use or pollution. |
| Producers and Directors | 0.117 | Switch between video sources in a studio or on multi-camera remotes, using equipment such as switchers, video slide projectors, and video effects generators. |
| Compliance Officers | 0.127 | Contract with freight forwarders for destination services. |
| Property, Real Estate, and Community Association Managers | 0.129 | Maintain records of sales, rental or usage activity, special permits issued, maintenance and operating costs, or property availability. |
| Accountants and Auditors | 0.130 | Analyze business operations, trends, costs, revenues, financial commitments, and obligations to project future revenues and expenses or to provide advice. |
| Compliance Officers | 0.130 | Review adverse drug reactions and file all related reports in accordance with regulatory agency guidelines. |
| First-Line Supervisors of Office and Administrative Support Workers | 0.132 | Keep informed of provisions of labor-management agreements and their effects on departmental operations. |

## 4) 如果要“按任务对齐”后再算风险，推荐口径

1. 在每个职业内，把 GDPval prompt 映射成 O*NET 任务分布 `p(t|q)`（soft top-k，而不是 hard top-1）。
2. 用 `p(t|q)` 聚合你已有的 O*NET 任务暴露度，得到 GDPval 任务口径暴露度 `E_q`。
3. 职业层面聚合 `E_occ_aligned = mean_q(E_q)`（q 为该职业 5 个 gold tasks）。
4. 再乘 GDPval 的职业胜率 `P_win_occ`：`Risk_occ = E_occ_aligned * P_win_occ`。
5. 最后按行业就业人数加权到行业/全国。

这样做的好处：把“暴露度任务宇宙”对齐到 GDPval 实际评测任务，减少 occupation-only 映射偏差。
