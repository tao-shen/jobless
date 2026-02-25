#!/usr/bin/env python3
"""Paper-style task exposure computation (no wage weighting).

This implementation follows the Iceberg paper structure:
1) Skills/tasks required by occupations (O*NET task ratings/statements).
2) AI capability mapped from tool ecosystem (Zapier + OpenTools + MCP server list).
3) Aggregation from task -> occupation -> industry using employment counts (BLS OEWS).

Note: The paper's exact 13k capability matrix and manual review labels are not publicly
released. This script reproduces the pipeline structure with public tool catalogs and
text-similarity mapping.
"""

from __future__ import annotations

import json
import math
import re
import string
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel


ROOT = Path(__file__).resolve().parent
ONET_DIR = ROOT / "data" / "raw" / "onet"
BLS_DIR = ROOT / "data" / "raw" / "bls"
OUT_DIR = ROOT / "output"
INTERIM_DIR = ROOT / "data" / "interim"

YEARS = [2019, 2020, 2021, 2022, 2023, 2024]

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}


def ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    INTERIM_DIR.mkdir(parents=True, exist_ok=True)


def to_float(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", "", regex=False), errors="coerce")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [str(c).strip().lower() for c in out.columns]
    return out


def cagr(start: float, end: float, periods: int) -> float:
    if periods <= 0:
        return float("nan")
    if start is None or end is None or start <= 0 or end <= 0:
        return float("nan")
    return (end / start) ** (1.0 / periods) - 1.0


def fetch_json(url: str, params: Optional[Dict] = None, retries: int = 3, sleep_sec: float = 0.5) -> Dict:
    for i in range(retries):
        try:
            r = requests.get(url, params=params, headers=UA, timeout=30)
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass
        time.sleep(sleep_sec * (i + 1))
    raise RuntimeError(f"Failed to fetch JSON after retries: {url}")


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    t = text
    t = re.sub(r"\[[^\]]+\]\([^)]+\)", " ", t)  # markdown links
    t = re.sub(r"https?://\S+", " ", t)
    t = re.sub(r"[`*_>#|]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip().lower()
    return t


def build_zapier_tool_corpus(force_refresh: bool = False, detail_limit: int = 1200) -> pd.DataFrame:
    cache = INTERIM_DIR / "tool_corpus_zapier.csv"
    if cache.exists() and not force_refresh:
        return pd.read_csv(cache)

    # 1) Build id from the app directory page.
    html = requests.get("https://zapier.com/apps", headers=UA, timeout=30).text
    m = re.search(r"_next/static/([^/]+)/_buildManifest\.js", html)
    if not m:
        raise RuntimeError("Cannot parse Zapier build id from /apps page.")
    build_id = m.group(1)
    base = f"https://nextplore.vercel.zapier-deployment.com/_next/data/{build_id}/find-apps"

    # 2) Crawl index pages (a-z + 0-9) to get slugs.
    index_entries: List[Tuple[str, str, str]] = []
    letters = list(string.ascii_lowercase) + ["0-9"]
    for s in letters:
        data = fetch_json(f"{base}/{s}.json")
        items = data.get("pageProps", {}).get("linkColumnItems", [])
        for it in items:
            href = str(it.get("href", ""))
            parts = href.strip("/").split("/")
            if len(parts) >= 3 and parts[0] == "find-apps":
                starts_with, slug = parts[1], parts[2]
                label = str(it.get("label", "")).strip()
                if slug:
                    index_entries.append((starts_with, slug, label))

    idx_df = pd.DataFrame(index_entries, columns=["starts_with", "slug", "label"]).drop_duplicates("slug")
    if idx_df.empty:
        raise RuntimeError("Zapier index crawl produced no tools.")

    # 3) Fetch detail JSON for a subset of slugs (for speed), keep all names.
    # We still keep the full Zapier app universe via index labels.
    results: List[Dict] = []

    def fetch_one(row: Tuple[str, str, str]) -> Optional[Dict]:
        starts_with, slug, label = row
        url = f"{base}/{starts_with}/{slug}.json"
        for i in range(3):
            try:
                obj = fetch_json(url, retries=1)
                app = obj.get("pageProps", {}).get("app", {})
                name = str(app.get("name", label)).strip() or label
                desc = str(app.get("description", "")).strip()
                return {
                    "source": "zapier",
                    "tool_id": str(app.get("id", slug)),
                    "tool_name": name,
                    "slug": slug,
                    "headline": "",
                    "description": desc,
                    "tags": "",
                    "tool_url": f"https://zapier.com/apps/{slug}/integrations",
                }
            except Exception:
                time.sleep(0.2 * (i + 1))
        # fallback to index label only
        return {
            "source": "zapier",
            "tool_id": slug,
            "tool_name": label,
            "slug": slug,
            "headline": "",
            "description": "",
            "tags": "",
            "tool_url": f"https://zapier.com/apps/{slug}/integrations",
        }

    rows = list(idx_df[["starts_with", "slug", "label"]].itertuples(index=False, name=None))
    detail_rows = rows[: min(detail_limit, len(rows))]
    with ThreadPoolExecutor(max_workers=20) as pool:
        futs = [pool.submit(fetch_one, r) for r in detail_rows]
        for i, fut in enumerate(as_completed(futs), 1):
            res = fut.result()
            if res is not None:
                results.append(res)
            if i % 500 == 0:
                print(f"[zapier] fetched detail {i}/{len(detail_rows)}")

    out = pd.DataFrame(results).drop_duplicates(["source", "slug"])
    existing_slugs = set(out["slug"].tolist())
    fallback_rows: List[Dict] = []
    for starts_with, slug, label in rows:
        if slug in existing_slugs:
            continue
        fallback_rows.append(
            {
                "source": "zapier",
                "tool_id": slug,
                "tool_name": label,
                "slug": slug,
                "headline": "",
                "description": "",
                "tags": "",
                "tool_url": f"https://zapier.com/apps/{slug}/integrations",
            }
        )
    if fallback_rows:
        out = pd.concat([out, pd.DataFrame(fallback_rows)], ignore_index=True)

    out.to_csv(cache, index=False)
    return out


def build_opentools_corpus(force_refresh: bool = False) -> pd.DataFrame:
    cache = INTERIM_DIR / "tool_corpus_opentools.csv"
    if cache.exists() and not force_refresh:
        return pd.read_csv(cache)

    rows: List[Dict] = []
    limit = 1000
    offset = 0
    total = None
    while True:
        obj = fetch_json("https://opentools.ai/api/tools", params={"offset": offset, "limit": limit})
        data = obj.get("data", [])
        total = obj.get("total", total)
        for it in data:
            tags = it.get("tags", [])
            if isinstance(tags, list):
                tags_s = ", ".join(str(x) for x in tags if isinstance(x, str))
            else:
                tags_s = str(tags)
            rows.append(
                {
                    "source": "opentools",
                    "tool_id": str(it.get("id", "")),
                    "tool_name": str(it.get("tool_name", "")).strip(),
                    "slug": str(it.get("slug", "")).strip(),
                    "headline": str(it.get("headline", "")).strip(),
                    "description": str(it.get("summary", "") or it.get("description", "")).strip(),
                    "tags": tags_s,
                    "tool_url": str(it.get("tool_url", "")),
                }
            )
        offset = obj.get("nextOffset")
        print(f"[opentools] collected {len(rows)} / {total if total is not None else '?'}")
        if not obj.get("hasNextPage") or offset is None:
            break

    out = pd.DataFrame(rows).drop_duplicates(["source", "tool_id"])
    out.to_csv(cache, index=False)
    return out


def build_mcp_corpus(force_refresh: bool = False) -> pd.DataFrame:
    cache = INTERIM_DIR / "tool_corpus_mcp.csv"
    if cache.exists() and not force_refresh:
        try:
            cached = pd.read_csv(cache)
            if not cached.empty:
                return cached
            print("[mcp] cached corpus is empty, refreshing from source...")
        except pd.errors.EmptyDataError:
            print("[mcp] cached corpus file is empty, refreshing from source...")

    # Public MCP server list from official repo README.
    url = "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md"
    txt = requests.get(url, headers=UA, timeout=30).text
    rows: List[Dict] = []
    for line in txt.splitlines():
        s = line.strip()
        if not s.startswith("- "):
            continue

        # Third-party and reference server bullets use bold markdown links:
        # - **[Server](url)** - Description
        m = re.search(r"\*\*\[([^\]]+)\]\((.*?)\)\*\*", s)
        if not m:
            continue

        name = m.group(1).strip()
        link = m.group(2).strip()
        desc = s[m.end() :].strip()
        desc = re.sub(r"^\s*[–—\-:]+\s*", "", desc)
        desc = re.sub(r"<img[^>]*>", " ", desc).strip()

        if not name:
            continue
        if name.lower() in {"name", "server", "tool"}:
            continue
        if not link:
            continue
        if not link.startswith("http"):
            link = f"https://github.com/modelcontextprotocol/servers/{link.lstrip('/')}"

        tool_id = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
        if not tool_id:
            tool_id = f"mcp_{len(rows)+1}"
        rows.append(
            {
                "source": "mcp_servers",
                "tool_id": tool_id,
                "tool_name": name,
                "slug": "",
                "headline": "",
                "description": desc or "MCP server",
                "tags": "mcp, model context protocol, server",
                "tool_url": link,
            }
        )

    out = pd.DataFrame(rows).drop_duplicates(["source", "tool_id"])
    out.to_csv(cache, index=False)
    return out


def build_tool_corpus(force_refresh: bool = False) -> pd.DataFrame:
    z = build_zapier_tool_corpus(force_refresh=force_refresh)
    o = build_opentools_corpus(force_refresh=force_refresh)
    m = build_mcp_corpus(force_refresh=force_refresh)

    tools = pd.concat([z, o, m], ignore_index=True)
    tools["tool_name"] = tools["tool_name"].fillna("").astype(str).str.strip()
    tools["headline"] = tools["headline"].fillna("").astype(str).str.strip()
    tools["description"] = tools["description"].fillna("").astype(str).str.strip()
    tools["tags"] = tools["tags"].fillna("").astype(str).str.strip()

    tools["tool_text"] = (
        tools["tool_name"] + ". " + tools["headline"] + ". " + tools["description"] + ". " + tools["tags"]
    ).map(clean_text)
    tools = tools[tools["tool_name"].str.len() > 0].copy()
    tools = tools.drop_duplicates(["source", "tool_name", "tool_text"]).reset_index(drop=True)
    tools.to_csv(INTERIM_DIR / "tool_corpus_all.csv", index=False)
    return tools


def read_onet_task_data() -> pd.DataFrame:
    task_stmt = pd.read_csv(ONET_DIR / "Task%20Statements.txt", sep="\t", dtype=str)
    task_ratings = pd.read_csv(ONET_DIR / "Task%20Ratings.txt", sep="\t", dtype=str)
    occ_data = pd.read_csv(ONET_DIR / "Occupation%20Data.txt", sep="\t", dtype=str)

    task_stmt = normalize_columns(task_stmt).rename(
        columns={
            "o*net-soc code": "onet_soc_code",
            "task id": "task_id",
            "task": "task_text",
            "task type": "task_type",
        }
    )
    task_ratings = normalize_columns(task_ratings).rename(
        columns={
            "o*net-soc code": "onet_soc_code",
            "task id": "task_id",
            "scale id": "scale_id",
            "category": "category",
            "data value": "data_value",
        }
    )
    occ_data = normalize_columns(occ_data).rename(
        columns={
            "o*net-soc code": "onet_soc_code",
            "title": "title",
        }
    )

    task_ratings["data_value"] = to_float(task_ratings["data_value"])
    task_ratings["category_num"] = to_float(task_ratings["category"])

    im = (
        task_ratings[task_ratings["scale_id"] == "IM"]
        .groupby(["onet_soc_code", "task_id"], as_index=False)["data_value"]
        .mean()
        .rename(columns={"data_value": "im"})
    )
    rt = (
        task_ratings[task_ratings["scale_id"] == "RT"]
        .groupby(["onet_soc_code", "task_id"], as_index=False)["data_value"]
        .mean()
        .rename(columns={"data_value": "rt"})
    )
    ft_raw = task_ratings[task_ratings["scale_id"] == "FT"].copy()
    ft = (
        ft_raw.assign(weighted=ft_raw["category_num"] * ft_raw["data_value"])
        .groupby(["onet_soc_code", "task_id"], as_index=False)
        .agg(ft_weighted=("weighted", "sum"), ft_total=("data_value", "sum"))
    )
    ft["ft_expected"] = ft["ft_weighted"] / ft["ft_total"]
    ft = ft[["onet_soc_code", "task_id", "ft_expected"]]

    task = (
        task_stmt[["onet_soc_code", "task_id", "task_text", "task_type"]]
        .drop_duplicates(["onet_soc_code", "task_id"])
        .merge(im, on=["onet_soc_code", "task_id"], how="left")
        .merge(rt, on=["onet_soc_code", "task_id"], how="left")
        .merge(ft, on=["onet_soc_code", "task_id"], how="left")
    )
    task["task_text_clean"] = task["task_text"].fillna("").map(clean_text)

    task["importance_norm"] = ((task["im"] - 1.0) / 4.0).clip(lower=0, upper=1)
    task["rt_norm"] = (task["rt"] / 100.0).clip(lower=0, upper=1)
    task["ft_norm"] = ((task["ft_expected"] - 1.0) / 6.0).clip(lower=0, upper=1)
    task["prevalence"] = np.where(
        task["rt_norm"].notna() & task["ft_norm"].notna(),
        0.5 * task["rt_norm"] + 0.5 * task["ft_norm"],
        np.where(task["rt_norm"].notna(), task["rt_norm"], np.where(task["ft_norm"].notna(), task["ft_norm"], 0.5)),
    )
    task["importance_norm"] = task["importance_norm"].fillna(task["importance_norm"].median())
    task["task_weight"] = (task["importance_norm"] * task["prevalence"]).clip(lower=0.01)

    task["soc_code"] = task["onet_soc_code"].str.extract(r"(\d{2}-\d{4})")
    task = task[task["soc_code"].notna()].copy()

    occ_data["soc_code"] = occ_data["onet_soc_code"].str.extract(r"(\d{2}-\d{4})")
    occ_data["is_base_variant"] = occ_data["onet_soc_code"].str.endswith(".00")
    occ_title = (
        occ_data.sort_values(["soc_code", "is_base_variant"], ascending=[True, False])
        .drop_duplicates("soc_code")[["soc_code", "title"]]
        .rename(columns={"title": "occupation_title"})
    )

    return task, occ_title


def map_tools_to_tasks(task_df: pd.DataFrame, tools_df: pd.DataFrame) -> pd.DataFrame:
    # Vectorize on combined corpus.
    tool_texts = tools_df["tool_text"].fillna("").astype(str).tolist()
    task_texts = task_df["task_text_clean"].fillna("").astype(str).tolist()

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_features=200000,
    )
    vectorizer.fit(tool_texts + task_texts)
    X_tools = vectorizer.transform(tool_texts)
    X_tasks = vectorizer.transform(task_texts)

    max_sim = np.zeros(X_tasks.shape[0], dtype=np.float32)
    top_idx = np.zeros(X_tasks.shape[0], dtype=np.int32)
    batch_size = 400
    for start in range(0, X_tasks.shape[0], batch_size):
        end = min(start + batch_size, X_tasks.shape[0])
        sims = linear_kernel(X_tasks[start:end], X_tools)  # dense ndarray
        idx = sims.argmax(axis=1)
        vals = sims[np.arange(sims.shape[0]), idx]
        max_sim[start:end] = vals.astype(np.float32)
        top_idx[start:end] = idx.astype(np.int32)
        if start % 4000 == 0:
            print(f"[mapping] processed tasks {start}/{X_tasks.shape[0]}")

    # Convert similarity to capability score (distribution-calibrated).
    p10 = np.nanpercentile(max_sim, 10)
    p90 = np.nanpercentile(max_sim, 90)
    denom = max(p90 - p10, 1e-6)
    auto = (max_sim - p10) / denom
    auto = np.clip(auto, 0.0, 1.0)
    auto = np.maximum(auto, 0.02)

    out = task_df.copy()
    out["tool_similarity"] = max_sim
    out["task_auto_score"] = auto
    out["top_tool_idx"] = top_idx
    out["top_tool_name"] = tools_df.iloc[top_idx]["tool_name"].values
    out["top_tool_source"] = tools_df.iloc[top_idx]["source"].values
    return out


def read_bls_excel(path: Path) -> pd.DataFrame:
    return normalize_columns(pd.read_excel(path, dtype=str))


def resolve_in4_file(year: int) -> Path:
    pattern = f"nat4d_M{year}_dl.xlsx"
    matches = list((BLS_DIR / f"oesm{str(year)[-2:]}in4").rglob(pattern))
    if not matches:
        raise FileNotFoundError(f"Cannot find {pattern}")
    return matches[0]


def resolve_nat_file(year: int) -> Path:
    pattern = f"national_M{year}_dl.xlsx"
    matches = list((BLS_DIR / f"oesm{str(year)[-2:]}nat").rglob(pattern))
    if not matches:
        raise FileNotFoundError(f"Cannot find {pattern}")
    return matches[0]


def normalize_sector_code(naics_code: str) -> str:
    if not isinstance(naics_code, str) or len(naics_code) < 2 or not naics_code[:2].isdigit():
        return "NA"
    code = naics_code[:2]
    if code in {"31", "32", "33"}:
        return "31-33"
    if code in {"44", "45"}:
        return "44-45"
    if code in {"48", "49"}:
        return "48-49"
    return code


SECTOR_TITLE = {
    "11": "Agriculture, Forestry, Fishing and Hunting",
    "21": "Mining, Quarrying, and Oil and Gas Extraction",
    "22": "Utilities",
    "23": "Construction",
    "31-33": "Manufacturing",
    "42": "Wholesale Trade",
    "44-45": "Retail Trade",
    "48-49": "Transportation and Warehousing",
    "51": "Information",
    "52": "Finance and Insurance",
    "53": "Real Estate and Rental and Leasing",
    "54": "Professional, Scientific, and Technical Services",
    "55": "Management of Companies and Enterprises",
    "56": "Administrative and Support and Waste Management and Remediation Services",
    "61": "Educational Services",
    "62": "Health Care and Social Assistance",
    "71": "Arts, Entertainment, and Recreation",
    "72": "Accommodation and Food Services",
    "81": "Other Services (except Public Administration)",
    "92": "Public Administration",
    "99": "Government and Special Designation Sectors",
    "NA": "Unknown",
}


def build_occupation_exposure(task_with_auto: pd.DataFrame, occ_title: pd.DataFrame) -> pd.DataFrame:
    weighted = task_with_auto.assign(w=task_with_auto["task_weight"] * task_with_auto["task_auto_score"]).groupby(
        "soc_code", as_index=False
    ).agg(weighted_num=("w", "sum"), weight_den=("task_weight", "sum"), task_count=("task_id", "nunique"))
    occ = weighted.copy()
    occ["occupation_exposure"] = occ["weighted_num"] / occ["weight_den"]
    occ = occ.merge(occ_title, on="soc_code", how="left")
    occ = occ.rename(columns={"title": "occupation_title"})
    return occ[["soc_code", "occupation_title", "occupation_exposure", "task_count", "weight_den"]]


def read_year_industry_exposure(year: int, occ_exposure: pd.DataFrame) -> pd.DataFrame:
    df = read_bls_excel(resolve_in4_file(year))
    d = df[df["o_group"].str.lower() == "detailed"].copy()
    if "area" in d.columns:
        d = d[d["area"].astype(str) == "99"]
    d = d[d["naics"].astype(str).str.fullmatch(r"\d{6}", na=False)]
    d["tot_emp"] = to_float(d["tot_emp"])
    d = d[d["tot_emp"].notna() & (d["tot_emp"] > 0)]

    d = d.merge(occ_exposure[["soc_code", "occupation_exposure"]], left_on="occ_code", right_on="soc_code", how="left")
    d["occupation_exposure"] = d["occupation_exposure"].fillna(0.0)
    d["exposed_emp"] = d["tot_emp"] * d["occupation_exposure"]
    d["matched_emp"] = np.where(d["occupation_exposure"] > 0, d["tot_emp"], 0.0)

    out = (
        d.groupby(["naics", "naics_title"], as_index=False)
        .agg(total_emp=("tot_emp", "sum"), matched_emp=("matched_emp", "sum"), exposed_emp=("exposed_emp", "sum"))
        .assign(
            year=year,
            industry_exposure=lambda x: x["exposed_emp"] / x["total_emp"],
            match_rate=lambda x: x["matched_emp"] / x["total_emp"],
        )
    )
    out["sector_code"] = out["naics"].map(normalize_sector_code)
    out["sector_title"] = out["sector_code"].map(SECTOR_TITLE).fillna("Unknown")
    return out


def read_year_national_occupation(year: int, occ_exposure: pd.DataFrame) -> pd.DataFrame:
    df = read_bls_excel(resolve_nat_file(year))
    d = df[df["o_group"].str.lower() == "detailed"].copy()
    d["tot_emp"] = to_float(d["tot_emp"])
    d = d[d["tot_emp"].notna() & (d["tot_emp"] > 0)]
    d = d.merge(occ_exposure[["soc_code", "occupation_exposure", "occupation_title"]], left_on="occ_code", right_on="soc_code", how="left")
    d["occupation_exposure"] = d["occupation_exposure"].fillna(0.0)
    d["occupation_title"] = d["occupation_title"].fillna(d["occ_title"])
    d["exposed_emp"] = d["tot_emp"] * d["occupation_exposure"]
    d["year"] = year
    return d[["year", "occ_code", "occupation_title", "tot_emp", "occupation_exposure", "exposed_emp"]]


def add_growth(df: pd.DataFrame, id_cols: List[str], value_col: str, years: List[int]) -> pd.DataFrame:
    wide = df.pivot_table(index=id_cols, columns="year", values=value_col, aggfunc="first").reset_index()
    y0, y1 = years[0], years[-1]
    if y0 in wide.columns and y1 in wide.columns:
        wide[f"{value_col}_chg_{y0}_{y1}"] = wide[y1] - wide[y0]
        wide[f"{value_col}_pct_{y0}_{y1}"] = (wide[y1] / wide[y0]) - 1.0
        wide[f"{value_col}_cagr_{y0}_{y1}"] = wide.apply(lambda r: cagr(r[y0], r[y1], y1 - y0), axis=1)
    prev = years[-2]
    if prev in wide.columns and y1 in wide.columns:
        wide[f"{value_col}_yoy_{prev}_{y1}"] = (wide[y1] / wide[prev]) - 1.0
    return wide


def format_pct(x: float) -> str:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return "NA"
    return f"{x * 100:.2f}%"


def build_report(
    occ: pd.DataFrame,
    industry_ts: pd.DataFrame,
    sector_ts: pd.DataFrame,
    industry_growth: pd.DataFrame,
    sector_growth: pd.DataFrame,
    occ_growth: pd.DataFrame,
    national_ts: pd.DataFrame,
    tools: pd.DataFrame,
) -> str:
    y0, y1 = YEARS[0], YEARS[-1]
    national_y = national_ts.groupby("year", as_index=False).agg(total_emp=("tot_emp", "sum"), exposed_emp=("exposed_emp", "sum"))
    national_y["national_exposure"] = national_y["exposed_emp"] / national_y["total_emp"]
    start_val = float(national_y.loc[national_y["year"] == y0, "national_exposure"].iloc[0])
    end_val = float(national_y.loc[national_y["year"] == y1, "national_exposure"].iloc[0])
    nat_cagr = cagr(start_val, end_val, y1 - y0)

    top_occ = occ.sort_values("occupation_exposure", ascending=False).head(20)
    top_industry_2024 = industry_ts[industry_ts["year"] == y1].sort_values("industry_exposure", ascending=False).head(20)
    top_sector_2024 = sector_ts[sector_ts["year"] == y1].sort_values("industry_exposure", ascending=False).head(20)
    fastest_sector = sector_growth.sort_values(f"industry_exposure_cagr_{y0}_{y1}", ascending=False).head(15)

    occ_growth_base = occ_growth.copy()
    if y0 in occ_growth_base.columns and y1 in occ_growth_base.columns:
        occ_growth_base = occ_growth_base[(occ_growth_base[y0] >= 5000) & (occ_growth_base[y1] >= 5000)]
    fastest_occ = occ_growth_base.sort_values(f"exposed_emp_cagr_{y0}_{y1}", ascending=False).head(20)

    src_counts = tools.groupby("source").size().to_dict()

    lines: List[str] = []
    lines.append("# 任务暴露度（论文流程版，不用工资加权）")
    lines.append("")
    lines.append(f"- 生成时间（UTC）: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"- 口径区间: {y0}-{y1}")
    lines.append("- 数据源:")
    lines.append("  - O*NET 30.1: Task Statements / Task Ratings / Occupation Data")
    lines.append("  - BLS OEWS: National industry-specific (`oesmYYin4`) + National occupation (`oesmYYnat`)")
    lines.append("  - Tool ecosystem (论文能力映射对应): Zapier + OpenTools + MCP servers")
    lines.append("")
    lines.append("## 方法")
    lines.append("")
    lines.append("1. 任务需求强度（O*NET）")
    lines.append("   - `w_t = Importance(IM)_norm × Prevalence(RT,FT)`")
    lines.append("2. AI 工具能力映射（论文结构对应）")
    lines.append("   - 构建工具语料（工具名+描述）")
    lines.append("   - 用 TF-IDF 语义相似度把工具能力映射到 O*NET 任务文本")
    lines.append("   - 得到任务可暴露度 `a_t`")
    lines.append("3. 职业暴露度")
    lines.append("   - `Exposure_occ = Σ(w_t × a_t) / Σ(w_t)`")
    lines.append("4. 行业暴露度（不使用工资）")
    lines.append("   - `Exposure_ind,year = Σ(emp_occ,ind,year × Exposure_occ) / Σ(emp_occ,ind,year)`")
    lines.append("5. 增速")
    lines.append("   - 同比 `YoY` + 复合增速 `CAGR`")
    lines.append("")
    lines.append("## 打分细则（本次实现）")
    lines.append("")
    lines.append("- 任务权重 `w_t`:")
    lines.append("  - `importance_norm = (IM - 1) / 4`")
    lines.append("  - `rt_norm = RT / 100`")
    lines.append("  - `ft_norm = (E[FT] - 1) / 6`，其中 `E[FT]` 为 FT 分布的期望")
    lines.append("  - `prevalence = 0.5 * rt_norm + 0.5 * ft_norm`（缺失值用可用项）")
    lines.append("  - `w_t = max(importance_norm * prevalence, 0.01)`")
    lines.append("- 任务可暴露度 `a_t`:")
    lines.append("  - 用 TF-IDF + cosine 计算任务文本与工具文本最大相似度 `sim_t`")
    lines.append("  - `a_t = clip((sim_t - p10)/(p90 - p10), 0, 1)`，再设下限 0.02")
    lines.append("- 职业暴露度:")
    lines.append("  - `Exposure_occ = Σ(w_t * a_t) / Σ(w_t)`")
    lines.append("- 行业暴露度（不含工资）:")
    lines.append("  - `Exposure_ind,year = Σ(emp_occ,ind,year * Exposure_occ) / Σ(emp_occ,ind,year)`")
    lines.append("- 增速:")
    lines.append("  - `YoY = Exposure_y / Exposure_(y-1) - 1`")
    lines.append("  - `CAGR = (Exposure_2024 / Exposure_2019)^(1/5) - 1`")
    lines.append("")
    lines.append("## 论文原始打分 vs 本次实现")
    lines.append("")
    lines.append("- 论文（原文）:")
    lines.append("  - 职业分数由“技能重要性 × 可自动化程度 × 普及度”聚合而成。")
    lines.append("  - 工具能力矩阵来自 13k+ 工具（MCP/Zapier/OpenTools），用 LLM in-context 映射到 BLS 技能分类，并做人工复核。")
    lines.append("  - 经济聚合层包含工资与就业价值。")
    lines.append("- 本次实现:")
    lines.append("  - 保持同一结构：任务权重 × AI能力映射 × 职业/行业聚合。")
    lines.append("  - 差异在能力映射：使用公开工具目录 + 文本相似度，不是论文的 LLM+人工复核 capability matrix。")
    lines.append("  - 按你的要求，去掉工资权重，仅用任务与就业。")
    lines.append("")
    lines.append("## 工具能力矩阵样本规模")
    lines.append("")
    lines.append(f"- 总工具数: {len(tools):,}")
    for k, v in sorted(src_counts.items(), key=lambda x: x[0]):
        lines.append(f"- {k}: {v:,}")
    lines.append("")
    lines.append("## 总体结果")
    lines.append("")
    lines.append(f"- 全国任务暴露度（就业加权）: {start_val:.4f} ({y0}) → {end_val:.4f} ({y1})")
    lines.append(f"- 全国任务暴露度 CAGR({y0}-{y1}): {format_pct(nat_cagr)}")
    lines.append("")

    lines.append(f"## 暴露度最高的职业（Top 20，{y1}）")
    lines.append("")
    lines.append("| SOC | 职业 | 任务暴露度 |")
    lines.append("|---|---|---:|")
    for _, r in top_occ.iterrows():
        lines.append(f"| {r['soc_code']} | {r['occupation_title']} | {r['occupation_exposure']:.4f} |")
    lines.append("")

    lines.append(f"## 暴露度最高的行业（NAICS 4-digit，Top 20，{y1}）")
    lines.append("")
    lines.append("| NAICS | 行业 | 任务暴露度 |")
    lines.append("|---|---|---:|")
    for _, r in top_industry_2024.iterrows():
        lines.append(f"| {r['naics']} | {r['naics_title']} | {r['industry_exposure']:.4f} |")
    lines.append("")

    lines.append(f"## 暴露度最高的行业大类（{y1}）")
    lines.append("")
    lines.append("| 行业大类 | 任务暴露度 |")
    lines.append("|---|---:|")
    for _, r in top_sector_2024.iterrows():
        lines.append(f"| {r['sector_title']} ({r['sector_code']}) | {r['industry_exposure']:.4f} |")
    lines.append("")

    lines.append(f"## 行业暴露度增速最快（按大类 CAGR，{y0}-{y1}）")
    lines.append("")
    lines.append("| 行业大类 | 暴露度CAGR | 暴露度同比(2023-2024) |")
    lines.append("|---|---:|---:|")
    for _, r in fastest_sector.iterrows():
        lines.append(
            f"| {r['sector_title']} ({r['sector_code']}) | "
            f"{format_pct(r[f'industry_exposure_cagr_{y0}_{y1}'])} | "
            f"{format_pct(r[f'industry_exposure_yoy_{YEARS[-2]}_{y1}'])} |"
        )
    lines.append("")

    lines.append(f"## 暴露任务就业量增速最快职业（Top 20，{y0}-{y1}）")
    lines.append("")
    lines.append("| SOC | 职业 | 暴露任务就业量CAGR | 暴露任务就业量同比(2023-2024) |")
    lines.append("|---|---|---:|---:|")
    for _, r in fastest_occ.iterrows():
        lines.append(
            f"| {r['occ_code']} | {r['occupation_title']} | "
            f"{format_pct(r[f'exposed_emp_cagr_{y0}_{y1}'])} | "
            f"{format_pct(r[f'exposed_emp_yoy_{YEARS[-2]}_{y1}'])} |"
        )
    lines.append("")

    lines.append("## 结果文件")
    lines.append("")
    lines.append("- `output/tool_corpus_all.csv`")
    lines.append("- `output/task_tool_mapping_sample.csv`")
    lines.append("- `output/occupation_task_exposure.csv`")
    lines.append("- `output/industry_exposure_by_year_naics4.csv`")
    lines.append("- `output/industry_exposure_growth_naics4.csv`")
    lines.append("- `output/industry_exposure_by_year_sector.csv`")
    lines.append("- `output/industry_exposure_growth_sector.csv`")
    lines.append("- `output/occupation_exposure_timeseries.csv`")
    lines.append("- `output/occupation_exposed_employment_growth.csv`")
    lines.append("")

    lines.append("## 与论文的差异")
    lines.append("")
    lines.append("- 一致: 采用“任务需求 × AI能力映射 × 聚合”的结构。")
    lines.append("- 差异: 论文使用 LLM+人工复核构建 capability matrix；此处用公开工具目录+文本相似度复现。")
    lines.append("- 已满足你的约束: 全流程不使用工资权重，仅用任务与就业。")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    ensure_dirs()

    print("[1/6] Build tool corpus...")
    tools = build_tool_corpus(force_refresh=False)
    tools.to_csv(OUT_DIR / "tool_corpus_all.csv", index=False)

    print("[2/6] Read O*NET tasks and weights...")
    task_df, occ_title = read_onet_task_data()

    print("[3/6] Map tools to tasks (similarity)...")
    task_auto = map_tools_to_tasks(task_df, tools)
    task_auto[["soc_code", "task_id", "task_text", "task_auto_score", "tool_similarity", "top_tool_name", "top_tool_source"]].head(5000).to_csv(
        OUT_DIR / "task_tool_mapping_sample.csv", index=False
    )

    print("[4/6] Build occupation exposure...")
    occ_exposure = build_occupation_exposure(task_auto, occ_title).sort_values("occupation_exposure", ascending=False)
    occ_exposure.to_csv(OUT_DIR / "occupation_task_exposure.csv", index=False)

    print("[5/6] Build industry and occupation time series...")
    industry_year = []
    occ_year = []
    for y in YEARS:
        industry_year.append(read_year_industry_exposure(y, occ_exposure))
        occ_year.append(read_year_national_occupation(y, occ_exposure))

    industry_ts = pd.concat(industry_year, ignore_index=True)
    occ_ts = pd.concat(occ_year, ignore_index=True)

    sector_ts = (
        industry_ts.groupby(["year", "sector_code", "sector_title"], as_index=False)
        .agg(total_emp=("total_emp", "sum"), exposed_emp=("exposed_emp", "sum"), matched_emp=("matched_emp", "sum"))
        .assign(industry_exposure=lambda x: x["exposed_emp"] / x["total_emp"], match_rate=lambda x: x["matched_emp"] / x["total_emp"])
    )

    industry_growth = add_growth(industry_ts, ["naics", "naics_title", "sector_code", "sector_title"], "industry_exposure", YEARS)
    sector_growth = add_growth(sector_ts, ["sector_code", "sector_title"], "industry_exposure", YEARS)
    occ_growth = add_growth(occ_ts, ["occ_code", "occupation_title"], "exposed_emp", YEARS)

    industry_ts.to_csv(OUT_DIR / "industry_exposure_by_year_naics4.csv", index=False)
    industry_growth.to_csv(OUT_DIR / "industry_exposure_growth_naics4.csv", index=False)
    sector_ts.to_csv(OUT_DIR / "industry_exposure_by_year_sector.csv", index=False)
    sector_growth.to_csv(OUT_DIR / "industry_exposure_growth_sector.csv", index=False)
    occ_ts.to_csv(OUT_DIR / "occupation_exposure_timeseries.csv", index=False)
    occ_growth.to_csv(OUT_DIR / "occupation_exposed_employment_growth.csv", index=False)

    print("[6/6] Write report...")
    report = build_report(occ_exposure, industry_ts, sector_ts, industry_growth, sector_growth, occ_growth, occ_ts, tools)
    (ROOT / "task_exposure_report.md").write_text(report, encoding="utf-8")

    # Summary json
    national = occ_ts.groupby("year", as_index=False).agg(total_emp=("tot_emp", "sum"), exposed_emp=("exposed_emp", "sum"))
    national["national_exposure"] = national["exposed_emp"] / national["total_emp"]
    summary = {
        "years": YEARS,
        "tool_count_total": int(len(tools)),
        "tool_count_by_source": tools.groupby("source").size().to_dict(),
        "national_exposure": [
            {"year": int(r.year), "exposure": float(r.national_exposure), "total_emp": float(r.total_emp), "exposed_emp": float(r.exposed_emp)}
            for r in national.itertuples(index=False)
        ],
    }
    with open(OUT_DIR / "summary_metrics.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("Done.")
    print(f"Report: {ROOT / 'task_exposure_report.md'}")
    print(f"Output: {OUT_DIR}")


if __name__ == "__main__":
    main()
