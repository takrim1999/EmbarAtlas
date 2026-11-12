# 🔥 Ember Atlas — Microgravity Fire Safety Research Dashboard
> NASA Space Apps Challenge 2026: **Flame in Freefall**

- **Live Dashboard:** [https://emberatlas.vercel.app/](https://emberatlas.vercel.app/)
- **Challenge:** [Flame in Freefall](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/)
- **Source & Provenance Register:** [docs/AI-AND-SOURCES.md](docs/AI-AND-SOURCES.md)

Ember Atlas helps students and researchers find, compare, and inspect NASA microgravity fire research. It combines a searchable evidence catalog, source-linked briefs, side-by-side study comparison, a traceable numerical explorer, and a grounded Super Intelligence (SI) research assistant.

![Ember Atlas Preview](ember-atlas-preview.jpg)

---

## 🚀 Key Features

### 1. 🔍 Reviewed Evidence Library (19 Investigations)
- Covers **5 detailed NASA Physical Sciences Informatics (PSI) briefs** (`BASS-II`, `Saffire-I`, `SAME`, `SAME-R`, `FLEX`) with DOIs, experimental conditions, and explicit scope boundaries, plus **14 discovery catalog entries** across ISS facilities (**CIR/ACME**, **CIR/MDCA**, **MSG**) and uncrewed spacecraft (**Saffire I–III**).
- Filter by fire-safety topic (`prevention`, `detection`, `suppression`, `combustion_science`), fuel geometry (`solid`, `liquid`, `gas`, `smoke`), or hardware.
- Distinguishes `source_checked`, `metadata_reviewed`, and `overview_only` records and labels editorial relevance scores clearly as browsing aids rather than NASA safety ratings.

### 2. 🤖 Grounded Super Intelligence (SI) Research Assistant (`gemini-3.5-flash-lite` & `gemini-3.1-flash-lite`)
- **Multi-Turn Evidence Grounding:** Attaches curated NASA evidence records on every conversation turn rather than relying on prior model turns as a source.
- **Structured Claim Boundaries:** Separates *Objectives*, *Methods*, *Observations*, and *Limitations*, and validates that bracketed source citations (`[PSI-25]`, `[PSI-69]`, `[PSI-98]`, `[PSI-101]`, `[PSI-102]`) belong to the supplied evidence scope.
- **Deterministic Source-Brief Fallback:** When live SI generation is unconfigured, times out, or produces out-of-scope citations, endpoints return a clearly labeled deterministic source brief rather than fabricated claims.

### 3. 📊 Source-Checked Numerical Data Explorer
- Imports **5 cell-checked methanol droplet tests** (`20CAL08`, `20CAL10`, `20CAL12`, `30CAL02`, `30CAL03`) from the NASA `PSI-69` (FLEX) Version 5 Experimental Table (rows 1–5).
- Retains each row's original FLEX test identifier, DOI, source URL, table location, and review date, preserving blank source cells (such as `30CAL02`'s missing visible-flame extinction diameter) as `null`.
- Supports one-click **CSV** and **JSON** export with full provenance metadata and spreadsheet formula-prefix escaping.

### 4. ⚖️ Side-by-Side Study Comparison
- Compare 2 to 3 investigations across topic, fuel type, hardware, facility, gravity regime, conditions, measurements, limitations, and evidence status, paired with optional grounded SI synthesis.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 6, TailwindCSS v4, Recharts, Lucide React, React Router v7, `marked` + `sanitize-html`
- **Backend:** Node.js (20–22), Express 5, optional `better-sqlite3` with process-local conversation fallback
- **Corpus Authority:** `server/data/dataset.json` (`2026-11-13-reviewed`) serves as the authoritative read-only research catalog across both SQLite and serverless deployments
- **SI Integration:** Google Gemini REST API (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`) with 18s per-model timeouts and server-side API key isolation

---

## 💻 Quick Start (Run Locally)

### Prerequisites
- Node.js 22 (supported range: Node 20–22)
- Optional: A Google Gemini API key (`GEMINI_API_KEY`)

```bash
npm ci
cp .env.example .env
# Optionally set GEMINI_API_KEY in .env
npm run build
npm start
```

Open `http://localhost:3001/nasa/` (or run `npm run dev` for Vite development at `http://localhost:5173/nasa/` with the Express API on port `3001`). Without an API key, all catalog browsing, comparisons, charts, exports, and deterministic source briefs work out of the box.

### Validate
```bash
npm test
npm run build
```

The automated test suite (`tests/regressions.test.js`) verifies test-level provenance, exclusion of legacy database rows, multiword hardware search, read-only public import locks (`403`), CSV/JSON provenance export, request validation, HTML sanitization, multi-turn evidence injection, citation validation, timeout handling, and UUIDv4 chat sessions.

---

## 🔬 Evidence Boundary & Scientific Integrity

- **Microgravity ≠ Partial Gravity:** Microgravity (~0g) combustion records do not establish lunar (1/6g) or Martian (3/8g) flammability limits or certify habitat atmospheric designs.
- **Transparent Provenance:** See [docs/AI-AND-SOURCES.md](docs/AI-AND-SOURCES.md) for the complete source register, cell-level FLEX table verification, and scope corrections.

---

## 📜 License & Attribution
- NASA supplies the primary scientific sources; the five detailed PSI records state `CC0-1.0`, while other NASA overview pages retain their applicable terms.
- Code is licensed under [LICENSE](LICENSE).
