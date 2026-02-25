#!/usr/bin/env python3
"""Rigorous replacement-risk computation (win-only).

Core principle:
1) Keep exposure (E) unchanged from O*NET task-based pipeline.
2) Estimate capability probability (P) at OCCUPATION level from GDPval win_rate.
3) Transfer P from GDPval occupations to all O*NET occupations via semantic similarity
   over occupation task corpora, with shrinkage to global model win_rate.
4) Compute risk = E * P, then aggregate by employment.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from difflib import SequenceMatcher, get_close_matches
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

import compute_task_exposure_paper_method as base


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output"
REPORT_PATH = ROOT / "gdpval_replacement_risk_rigorous_report.md"
JS_CACHE = ROOT / "data" / "raw" / "gdpval" / "leaderboard_bundle.js"

GDPVAL_BUNDLE_URL = "https://evals.openai.com/assets/index-BeFXzkDd.js"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}

K_NEIGHBORS = 5
NAME_MATCH_CUTOFF = 0.82


@dataclass
class ParsedGDPval:
    totals: pd.DataFrame
    by_occ: pd.DataFrame


def clean_title(s: str) -> str:
    if not isinstance(s, str):
        return ""
    x = s.lower().strip()
    x = x.replace("&", " and ")
    x = re.sub(r"[^a-z0-9\s]", " ", x)
    x = re.sub(r"\s+", " ", x).strip()
    return x


def parse_float_js(token: str) -> float:
    t = token.strip()
    if t.startswith("."):
        t = "0" + t
    if t == "-.0":
        t = "0"
    return float(t)


def fetch_bundle(force_refresh: bool = False) -> str:
    JS_CACHE.parent.mkdir(parents=True, exist_ok=True)
    if JS_CACHE.exists() and not force_refresh:
        return JS_CACHE.read_text(encoding="utf-8")
    txt = requests.get(GDPVAL_BUNDLE_URL, headers=UA, timeout=60).text
    JS_CACHE.write_text(txt, encoding="utf-8")
    return txt


def parse_gdpval(js_text: str) -> ParsedGDPval:
    m = re.search(r"GI=\[(.*?)\],\$I=\{totals:GI\}", js_text, re.DOTALL)
    if not m:
        raise RuntimeError("Cannot locate GDPval totals block in bundle.")
    totals_rows = re.findall(
        r'\{model:"([^"]+)",win_rate:([^,}]+),win_or_tie_rate:([^,}]+)\}',
        m.group(1),
    )
    totals = pd.DataFrame(
        [
            {
                "model": model,
                "win_rate": parse_float_js(w),
                "win_or_tie_rate": parse_float_js(wt),
            }
            for model, w, wt in totals_rows
        ]
    )
    totals = totals[totals["model"] != "human"].drop_duplicates("model").reset_index(drop=True)

    occ_rows = re.findall(
        r'\{model:"([^"]+)",sector:"([^"]+)",occupation:"([^"]+)",win_rate:([^,}]+),win_or_tie_rate:([^,}]+)\}',
        js_text,
    )
    by_occ = pd.DataFrame(
        [
            {
                "model": model,
                "gdpval_sector": sector,
                "gdpval_occupation": occ,
                "win_rate": parse_float_js(w),
                "win_or_tie_rate": parse_float_js(wt),
            }
            for model, sector, occ, w, wt in occ_rows
        ]
    ).drop_duplicates(["model", "gdpval_occupation"])
    return ParsedGDPval(totals=totals, by_occ=by_occ)


def build_occupation_corpus(occ_exposure: pd.DataFrame) -> pd.DataFrame:
    task_stmt = pd.read_csv(ROOT / "data" / "raw" / "onet" / "Task%20Statements.txt", sep="\t", dtype=str)
    task_stmt = base.normalize_columns(task_stmt).rename(
        columns={
            "o*net-soc code": "onet_soc_code",
            "task id": "task_id",
            "task": "task_text",
            "task type": "task_type",
        }
    )
    task_stmt["soc_code"] = task_stmt["onet_soc_code"].str.extract(r"(\d{2}-\d{4})")
    task_stmt = task_stmt[task_stmt["soc_code"].notna()].copy()
    # Use core tasks first, fallback to all if missing.
    core = task_stmt[task_stmt["task_type"].astype(str).str.lower() == "core"].copy()
    grp_core = core.groupby("soc_code")["task_text"].apply(lambda s: " ".join(s.astype(str).tolist())).rename("task_text_core")
    grp_all = task_stmt.groupby("soc_code")["task_text"].apply(lambda s: " ".join(s.astype(str).tolist())).rename("task_text_all")

    corpus = occ_exposure[["soc_code", "occupation_title"]].copy()
    corpus = corpus.merge(grp_core, on="soc_code", how="left").merge(grp_all, on="soc_code", how="left")
    task_text = corpus["task_text_core"].where(corpus["task_text_core"].notna(), corpus["task_text_all"]).fillna("")
    corpus["occ_text"] = (
        corpus["occupation_title"].fillna("").astype(str)
        + ". "
        + task_text
    )
    corpus["occ_text"] = corpus["occ_text"].map(base.clean_text)
    return corpus[["soc_code", "occupation_title", "occ_text"]]


def build_name_mapping(gdpval_occ_names: List[str], occ_titles: pd.DataFrame) -> pd.DataFrame:
    occ_titles = occ_titles.copy()
    occ_titles["title_norm"] = occ_titles["occupation_title"].map(clean_title)
    title_norms = occ_titles["title_norm"].tolist()
    title_map = dict(zip(occ_titles["title_norm"], occ_titles["occupation_title"]))
    soc_map = dict(zip(occ_titles["title_norm"], occ_titles["soc_code"]))

    rows = []
    for name in sorted(set(gdpval_occ_names)):
        n = clean_title(name)
        chosen = None
        sim = 0.0
        method = "none"
        if n in soc_map:
            chosen = n
            sim = 1.0
            method = "exact"
        else:
            cands = get_close_matches(n, title_norms, n=1, cutoff=NAME_MATCH_CUTOFF)
            if cands:
                chosen = cands[0]
                sim = SequenceMatcher(None, n, chosen).ratio()
                method = "fuzzy"

        if chosen is None:
            rows.append(
                {
                    "gdpval_occupation": name,
                    "soc_code": None,
                    "occupation_title": None,
                    "name_similarity": 0.0,
                    "match_method": "unmatched",
                }
            )
        else:
            rows.append(
                {
                    "gdpval_occupation": name,
                    "soc_code": soc_map[chosen],
                    "occupation_title": title_map[chosen],
                    "name_similarity": float(sim),
                    "match_method": method,
                }
            )
    return pd.DataFrame(rows)


def build_similarity_transfer_matrix(corpus: pd.DataFrame, anchor_soc: List[str], k: int = K_NEIGHBORS) -> Tuple[np.ndarray, np.ndarray, Dict[str, float]]:
    all_text = corpus["occ_text"].fillna("").astype(str).tolist()
    anchor_mask = corpus["soc_code"].isin(anchor_soc)
    anchor_df = corpus[anchor_mask].copy()
    anchor_df = anchor_df.set_index("soc_code").loc[anchor_soc].reset_index()

    vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=2, max_features=200000)
    vec.fit(all_text + anchor_df["occ_text"].fillna("").astype(str).tolist())
    x_all = vec.transform(all_text)
    x_anchor = vec.transform(anchor_df["occ_text"].fillna("").astype(str).tolist())
    sims = linear_kernel(x_all, x_anchor)

    n_all, n_anchor = sims.shape
    k_eff = min(k, n_anchor)
    top_idx = np.argpartition(sims, -k_eff, axis=1)[:, -k_eff:]
    top_val = np.take_along_axis(sims, top_idx, axis=1)
    order = np.argsort(top_val, axis=1)[:, ::-1]
    top_idx = np.take_along_axis(top_idx, order, axis=1)
    top_val = np.take_along_axis(top_val, order, axis=1)

    top_val = np.clip(top_val, 0.0, None)
    denom = np.clip(top_val.sum(axis=1, keepdims=True), 1e-12, None)
    w_local = top_val / denom

    # build dense transfer matrix W (n_all x n_anchor)
    W = np.zeros_like(sims)
    for i in range(n_all):
        W[i, top_idx[i]] = w_local[i]

    strength = top_val.mean(axis=1)
    q10 = float(np.quantile(strength, 0.10))
    q90 = float(np.quantile(strength, 0.90))
    alpha = (strength - q10) / max(q90 - q10, 1e-9)
    alpha = np.clip(alpha, 0.0, 1.0)

    meta = {"sim_strength_q10": q10, "sim_strength_q90": q90, "sim_strength_mean": float(np.mean(strength)), "k": int(k_eff)}
    return W, alpha, meta


def read_nat_occ_2024() -> pd.DataFrame:
    df = base.read_bls_excel(base.resolve_nat_file(2024))
    d = df[df["o_group"].str.lower() == "detailed"].copy()
    d["tot_emp"] = base.to_float(d["tot_emp"])
    d = d[d["tot_emp"].notna() & (d["tot_emp"] > 0)]
    return d[["occ_code", "occ_title", "tot_emp"]]


def read_industry_detail_2024() -> pd.DataFrame:
    df = base.read_bls_excel(base.resolve_in4_file(2024))
    d = df[df["o_group"].str.lower() == "detailed"].copy()
    if "area" in d.columns:
        d = d[d["area"].astype(str) == "99"]
    d = d[d["naics"].astype(str).str.fullmatch(r"\d{6}", na=False)]
    d["tot_emp"] = base.to_float(d["tot_emp"])
    d = d[d["tot_emp"].notna() & (d["tot_emp"] > 0)]
    d["sector_code"] = d["naics"].map(base.normalize_sector_code)
    d["sector_title"] = d["sector_code"].map(base.SECTOR_TITLE).fillna("Unknown")
    return d


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    occ_exp_path = OUT_DIR / "occupation_task_exposure.csv"
    if not occ_exp_path.exists():
        raise FileNotFoundError(f"Missing {occ_exp_path}. Run baseline exposure first.")
    occ_exposure = pd.read_csv(occ_exp_path, dtype={"soc_code": str})

    js = fetch_bundle(force_refresh=True)
    parsed = parse_gdpval(js)

    corpus = build_occupation_corpus(occ_exposure)
    name_map = build_name_mapping(parsed.by_occ["gdpval_occupation"].tolist(), occ_exposure[["soc_code", "occupation_title"]])
    anchors = name_map[name_map["soc_code"].notna()].copy()
    unmatched = name_map[name_map["soc_code"].isna()].copy()
    anchor_soc = anchors["soc_code"].astype(str).unique().tolist()

    W, alpha, transfer_meta = build_similarity_transfer_matrix(corpus, anchor_soc, k=K_NEIGHBORS)
    soc_to_idx = {s: i for i, s in enumerate(corpus["soc_code"].tolist())}
    anchor_idx = [soc_to_idx[s] for s in anchor_soc]

    # Build per-model occupation win probability.
    occ_probs_rows = []
    overall_rows = []
    ind24 = read_industry_detail_2024()

    base_occ = occ_exposure[["soc_code", "occupation_title", "occupation_exposure"]].copy()
    nat24 = read_nat_occ_2024()
    base_occ = base_occ.merge(nat24[["occ_code", "tot_emp"]], left_on="soc_code", right_on="occ_code", how="left")
    base_occ["tot_emp"] = base_occ["tot_emp"].fillna(0.0)

    for m in parsed.totals["model"].tolist():
        global_p = float(parsed.totals.loc[parsed.totals["model"] == m, "win_rate"].iloc[0])

        occ_m = parsed.by_occ[parsed.by_occ["model"] == m][["gdpval_occupation", "win_rate"]].copy()
        occ_m = occ_m.merge(anchors[["gdpval_occupation", "soc_code"]], on="gdpval_occupation", how="inner")
        occ_m = occ_m.dropna(subset=["soc_code"]).drop_duplicates("soc_code")
        p_anchor_map = dict(zip(occ_m["soc_code"].astype(str), occ_m["win_rate"].astype(float)))
        p_anchor = np.array([p_anchor_map.get(s, global_p) for s in anchor_soc], dtype=float)

        p_knn = W @ p_anchor
        p_all = alpha * p_knn + (1.0 - alpha) * global_p
        # For mapped anchors, use direct GDPval occupation win_rate.
        for s, p in p_anchor_map.items():
            p_all[soc_to_idx[s]] = p
        p_all = np.clip(p_all, 0.0, 1.0)

        occ_model = base_occ.copy()
        occ_model["model"] = m
        occ_model["model_global_win_rate"] = global_p
        occ_model["ai_win_probability_occ"] = [float(p_all[soc_to_idx[s]]) for s in occ_model["soc_code"]]
        occ_model["replacement_risk_occ"] = occ_model["occupation_exposure"] * occ_model["ai_win_probability_occ"]
        occ_model["expected_affected_emp_occ"] = occ_model["replacement_risk_occ"] * occ_model["tot_emp"]
        occ_model["transfer_alpha"] = [float(alpha[soc_to_idx[s]]) for s in occ_model["soc_code"]]
        occ_model["is_anchor_direct"] = occ_model["soc_code"].isin(p_anchor_map).astype(int)
        occ_probs_rows.append(occ_model)

        # Keep national aggregation on the same IN4 employment universe as industry outputs.
        d_model = ind24.merge(
            occ_model[["soc_code", "occupation_exposure", "ai_win_probability_occ"]],
            left_on="occ_code",
            right_on="soc_code",
            how="left",
        )
        d_model["occupation_exposure"] = d_model["occupation_exposure"].fillna(0.0)
        d_model["ai_win_probability_occ"] = d_model["ai_win_probability_occ"].fillna(global_p)
        d_model["risk_prob_occ"] = d_model["occupation_exposure"] * d_model["ai_win_probability_occ"]
        d_model["expected_affected_emp"] = d_model["risk_prob_occ"] * d_model["tot_emp"]
        d_model["exposure_emp"] = d_model["occupation_exposure"] * d_model["tot_emp"]

        total_emp = float(d_model["tot_emp"].sum())
        national_exposure = float(d_model["exposure_emp"].sum() / max(total_emp, 1e-9))
        national_risk = float(d_model["expected_affected_emp"].sum() / max(total_emp, 1e-9))
        overall_rows.append(
            {
                "model": m,
                "model_global_win_rate": global_p,
                "national_total_employment": total_emp,
                "national_exposure_emp_weighted": national_exposure,
                "national_replacement_risk_emp_weighted": national_risk,
            }
        )

    occ_probs = pd.concat(occ_probs_rows, ignore_index=True)
    overall = pd.DataFrame(overall_rows).sort_values("national_replacement_risk_emp_weighted", ascending=False).reset_index(drop=True)
    best_model = str(overall.iloc[0]["model"])

    # Industry aggregation for best model (more detailed sector interpretation).
    best_occ = occ_probs[occ_probs["model"] == best_model][["soc_code", "occupation_exposure", "ai_win_probability_occ"]].copy()
    d = ind24.merge(best_occ, left_on="occ_code", right_on="soc_code", how="left")
    d["occupation_exposure"] = d["occupation_exposure"].fillna(0.0)
    d["ai_win_probability_occ"] = d["ai_win_probability_occ"].fillna(float(overall.iloc[0]["model_global_win_rate"]))
    d["risk_prob_occ"] = d["occupation_exposure"] * d["ai_win_probability_occ"]
    d["expected_affected_emp"] = d["tot_emp"] * d["risk_prob_occ"]
    d["exposure_emp"] = d["tot_emp"] * d["occupation_exposure"]

    sec = (
        d.groupby(["sector_code", "sector_title"], as_index=False)
        .agg(total_emp=("tot_emp", "sum"), expected_affected_emp=("expected_affected_emp", "sum"), exposure_emp=("exposure_emp", "sum"))
    )
    sec["industry_emp_share"] = sec["total_emp"] / sec["total_emp"].sum()
    sec["industry_exposure"] = sec["exposure_emp"] / sec["total_emp"]
    sec["replacement_risk_probability"] = sec["expected_affected_emp"] / sec["total_emp"]
    sec["weighted_risk_contribution"] = sec["industry_emp_share"] * sec["replacement_risk_probability"]
    sec["effective_ai_win_probability"] = np.where(sec["exposure_emp"] > 0, sec["expected_affected_emp"] / sec["exposure_emp"], 0.0)
    sec = sec.sort_values("weighted_risk_contribution", ascending=False).reset_index(drop=True)

    # Save outputs
    name_map.to_csv(OUT_DIR / "gdpval_occ_name_mapping_rigorous.csv", index=False)
    occ_probs.to_csv(OUT_DIR / "occupation_win_probability_by_model_rigorous.csv", index=False)
    overall.to_csv(OUT_DIR / "overall_ai_replacement_probability_by_model_rigorous.csv", index=False)
    sec.to_csv(OUT_DIR / "industry_ai_replacement_risk_top_model_rigorous.csv", index=False)

    summary = {
        "best_model": best_model,
        "best_model_national_replacement_risk_emp_weighted": float(overall.iloc[0]["national_replacement_risk_emp_weighted"]),
        "anchor_occupations_matched": int(anchors["soc_code"].notna().sum()),
        "anchor_occupations_unmatched": int(len(unmatched)),
        "anchor_mean_name_similarity": float(anchors["name_similarity"].mean()) if len(anchors) else 0.0,
        "transfer": transfer_meta,
    }
    with open(OUT_DIR / "rigorous_method_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    # Report
    lines: List[str] = []
    lines.append("# GDPval × 暴露度（最严谨映射版，Win-only）")
    lines.append("")
    lines.append("- 核心：不校准暴露度本体；只在职业层映射模型胜率，然后乘以暴露度。")
    lines.append("- 风险定义：`risk_occ = exposure_occ × p_win_occ`，`p_win_occ` 仅用 `win_rate`。")
    lines.append("- 聚合：按就业人数加权。")
    lines.append("")
    lines.append("## 映射质量")
    lines.append("")
    lines.append(f"- GDPval职业条目数: {parsed.by_occ['gdpval_occupation'].nunique()}")
    lines.append(f"- 成功映射到SOC: {int(anchors['soc_code'].notna().sum())}")
    lines.append(f"- 未映射: {int(len(unmatched))}")
    lines.append(f"- 映射名称平均相似度: {float(anchors['name_similarity'].mean()):.4f}")
    lines.append(f"- 语义转移: k={transfer_meta['k']}, sim_strength_q10={transfer_meta['sim_strength_q10']:.4f}, sim_strength_q90={transfer_meta['sim_strength_q90']:.4f}")
    lines.append("")
    lines.append("## 全国总概率（按模型）")
    lines.append("")
    lines.append("| 模型 | 全局Win率 | 全国暴露度(就业加权) | 全国替代风险概率(就业加权) |")
    lines.append("|---|---:|---:|---:|")
    for _, r in overall.head(12).iterrows():
        lines.append(
            f"| {r['model']} | {r['model_global_win_rate']:.4f} | "
            f"{r['national_exposure_emp_weighted']:.4f} | {r['national_replacement_risk_emp_weighted']:.4f} |"
        )
    lines.append("")
    lines.append(f"## 行业结果（最佳模型 `{best_model}`）")
    lines.append("")
    lines.append("| 行业大类 | 就业人数 | 暴露度 | 有效Win率 | 风险概率 | 对全国总风险贡献 |")
    lines.append("|---|---:|---:|---:|---:|---:|")
    for _, r in sec.head(20).iterrows():
        lines.append(
            f"| {r['sector_title']} ({r['sector_code']}) | {r['total_emp']:,.0f} | {r['industry_exposure']:.4f} | "
            f"{r['effective_ai_win_probability']:.4f} | {r['replacement_risk_probability']:.4f} | {r['weighted_risk_contribution']:.4f} |"
        )
    lines.append("")
    lines.append("## 输出文件")
    lines.append("")
    lines.append("- `output/gdpval_occ_name_mapping_rigorous.csv`")
    lines.append("- `output/occupation_win_probability_by_model_rigorous.csv`")
    lines.append("- `output/overall_ai_replacement_probability_by_model_rigorous.csv`")
    lines.append("- `output/industry_ai_replacement_risk_top_model_rigorous.csv`")
    lines.append("- `output/rigorous_method_summary.json`")

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Done. Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
