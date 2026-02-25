# 行业风险与总风险计算框架（任务级对齐版）

```mermaid
flowchart TD
    A[数据源] --> A1[O*NET Task Statements + Ratings]
    A --> A2[BLS OES IN4 2024 行业-职业就业]
    A --> A3[GDPval Gold 220 tasks]
    A --> A4[GDPval Leaderboard by_occupation win_rate]

    A1 --> B1[构建 O*NET 任务权重\nimportance × prevalence]
    A1 --> B2[任务文本向量化]
    B2 --> B3[任务自动化分数 task_auto_score]
    B1 --> B4[任务权重先验]
    B3 --> C1[O*NET任务暴露底座]

    A3 --> C2[GDPval任务 q]
    C2 --> C3[按职业映射到SOC池\n(含 Buyers 手工拆分)]
    C3 --> C4[同职业内任务语义匹配\n得到 p(t|q)]
    C1 --> C4
    B4 --> C4

    C4 --> C5[任务级暴露 E_q = Σ_t p(t|q) × task_auto_score_t]
    C5 --> C6[职业暴露 E_occ_aligned = mean_q(E_q)]

    A4 --> D1[职业胜率 P_win_occ\n(仅 win_rate)]
    C6 --> D2[职业风险 Risk_occ = E_occ × P_win_occ]
    D1 --> D2

    A2 --> E1[按行业-职业就业加权]
    D2 --> E1

    E1 --> E2[行业风险\nRisk_ind = Σ_occ(emp_occ×Risk_occ)/Σ_occ(emp_occ)]
    E1 --> E3[全国总风险\nRisk_nat = Σ_ind(emp_ind×Risk_ind)/Σ_ind(emp_ind)]
```

## 关键公式

- 任务对齐暴露：
  - `E_q = Σ_t p(t|q) * e_t`
  - 其中 `e_t = task_auto_score_t`，`p(t|q)` 来自 GDPval prompt 与 O*NET 任务的语义相似度（top-k + 任务权重先验归一化）。
- 职业暴露：
  - `E_occ = mean_q(E_q)`（每个 GDPval 职业 5 个 gold tasks）
- 职业风险：
  - `Risk_occ = E_occ * P_win_occ`
- 行业风险（就业加权）：
  - `Risk_ind = Σ_occ(emp_occ * Risk_occ) / Σ_occ(emp_occ)`
- 全国总风险（就业加权）：
  - `Risk_nat = Σ_ind(emp_ind * Risk_ind) / Σ_ind(emp_ind)`

## 对齐口径说明

- `P_win_occ` 使用 GDPval `win_rate`（不计 tie）。
- 已覆盖 GDPval 220/220 任务；职业映射含论文附录指出的拆分职业。
- 行业风险与总风险统一在 `IN4 2024` 就业口径下聚合，保证可加总一致。
