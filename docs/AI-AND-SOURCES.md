# Super Intelligence (SI) use and source provenance

Reviewed: November 13, 2026. Corpus version: `2026-11-13-reviewed`.

## Runtime SI architecture and boundaries

Runtime generation uses Google's Gemini REST API with configurable model names (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`). Each request sends selected public NASA metadata, the user's question, and recent conversation turns. No API keys are sent to the frontend. Every turn includes current evidence; old model responses are not treated as sources. Invalid or absent citation IDs, timeouts, missing credentials, blocked responses, or provider failures return a deterministic source brief with an explicit label. A source brief is not a generated scientific answer.

Citation membership checks verify that bracketed IDs belong to the supplied evidence selection; they cannot establish factual accuracy or scientific entailment. The system prompt separates objectives, methods, observations, and limitations, and rendered Markdown is sanitized with `sanitize-html`. Review all SI interpretations against the primary NASA source.

## Five detailed metadata records

| ID | Investigation | DOI | Reviewed scope |
|---|---|---|---|
| PSI-25 | BASS-II | 10.60555/4qc4-de67 | Objectives and metadata; no imported run-level results |
| PSI-98 | Saffire-I | 10.60555/0t15-1z43 | Objectives and approach; no imported run-level results |
| PSI-102 | SAME | 10.60555/gd4k-8h62 | Objectives and approach; particle-size hypotheses are not reported findings |
| PSI-101 | SAME-R | 10.60555/2np7-jv14 | Objectives and approach; source describes contamination of original SAME TEM grids |
| PSI-69 | FLEX | 10.60555/mbq8-0451 | Objectives, approach, and version 5 experimental-table rows 1–5 |

Primary record URLs are `https://psi.nasa.gov/physci/repo/data/investigations/` followed by the ID. The active corpus preserves the distinction between investigation objectives and experimental findings.

## Numerical sample, checked November 13

Source: [NASA PSI-69](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69), version 5, Experimental Table, first page (rows 1–5 of 275 displayed tests). Original identifiers and selected units are retained.

| FLEX Test # | Identifier | Fuel | Pressure (mmHg) | Initial O₂ mole fraction | Initial diameter (mm) | Visible-flame extinction diameter (mm) | Burn time (s) | Test end |
|---|---|---|---:|---:|---:|---:|---:|---|
| 1 | 20CAL08 | Methanol | 757.7 | 0.21 | 1.69 | 0.89 | 4.3 | Disruption |
| 2 | 20CAL10 | Methanol | 762 | 0.21 | 1.86 | 0.94 | 5 | Extinction |
| 3 | 20CAL12 | Methanol | 764.2 | 0.21 | 1.61 | 0.92 | 3.2 | Extinction |
| 4 | 30CAL02 | Methanol | 760 | 0.21 | 2.06 | missing | 7.64 | Extinction |
| 5 | 30CAL03 | Methanol | 760 | 0.21 | 1.92 | 0.81 | 6.34 | Extinction |

The source's blank extinction diameter for `30CAL02` is stored as `null`, not zero. The adjacent `0.6` belongs to the burning-rate column, which is not imported. Every active row includes `source_url`, `source_doi`, `source_location`, `verified_at`, and `evidence_status`. Exported files retain those fields.

Do not compare unlike tests as a controlled study. Individual test runs illustrate microgravity combustion phenomena across prevention, detection, and suppression, but do not certify solid-material flight safety without full operational margin testing. No partial-gravity numerical observations are included.

## Other discovery entries

These 14 entries are marked `overview_only`. Detailed numeric conditions, flight dates, outcomes, and technology-transfer claims without direct source verification are excluded.

- **BASS, DAFT, SPICE, SLICE:** [NASA Glenn combustion overview](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/).
- **FLEX-2 and BRE:** [NASA: Studying Combustion and Fire Safety](https://www.nasa.gov/missions/station/iss-research/studying-combustion-and-fire-safety/).
- **E-FIELD Flames, CFI-G, CLD Flame:** [NASA: Space Station’s Quest for the Secrets of Fire](https://www.nasa.gov/humans-in-space/space-stations-quest-for-the-secrets-of-fire/).
- **Saffire-II, Saffire-III, CFI, s-Flame, DAFT-2:** [NASA PSI investigations by research area](https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/).

App IDs such as `ACME-BRE` and `DAFT` are navigation identifiers, not NASA-issued PSI IDs.

## Scope corrections

- `DAFT`/`DAFT-2` refer to **Dust and Aerosol Measurement Feasibility Test**, not droplet combustion. DAFT supports particle-instrument feasibility for SAME.
- `s-Flame` refers to **Structure and Response of Spherical Diffusion Flames**, not Structure and Liftoff in Flames.
- `BRE` burns gaseous fuel to emulate material flammability; it is not a liquid-droplet experiment.
- Unverified `ACME-COFLOW` and unreviewed `LUCI`/`FM2` entries are excluded from the active corpus.

## Interpretation and licensing

Scores are editorial (`8` for prevention/detection/suppression topics and `6` for foundational combustion topics). They are not calibrated, measured, or NASA-assigned safety scores. The five linked PSI records list `CC0-1.0`; other NASA sources retain their applicable terms.
