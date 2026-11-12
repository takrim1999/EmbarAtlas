# Ember Atlas: product decision and six-day plan

Planning date: November 6, 2026, Asia/Dhaka. Team: three coders and two presenters. The team's exact organizer deadline is still unconfirmed; use November 12 as an internal completion target.

## The problem in ordinary language

Researchers need to find which space-fire experiments answer their question, understand the test conditions, and compare evidence without losing its context. The product reduces the effort between a question and a defensible, cited research brief.

**Product sentence:** Ember Atlas helps aerospace students and researchers find, compare, and interpret NASA microgravity combustion evidence.

**First user:** an aerospace student researching spacecraft smoke detection. This is narrow enough to test and demo convincingly.

**First demo question:** “Which experiments should I read to understand smoke detection in microgravity, and how do SAME and SAME-R differ?”

The [challenge](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/) calls for an interactive intelligence-powered research dashboard. Its emphasis is discoverability, comparison, and interpretation. Build around those jobs. Its current title uses “SI”; do not claim that using a language model constitutes superintelligence.

## A complete product interaction

1. Choose smoke detection or enter a research question.
2. See ranked investigation cards with a visible reason for each match.
3. Compare SAME and SAME-R: methods, measured quantities, changed conditions, and limitations.
4. Ask for an explanation supported by selected source passages.
5. Open the cited report section and export a brief.

The current prototype implements steps 1–3 and curated briefs for step 5. Step 4 is the next engineering milestone. Its separate FLEX view demonstrates honest numerical exploration with a small sample.

## Scope for the submission

| Feature | Required outcome | Current status |
| --- | --- | --- |
| Evidence discovery | Find and rank relevant studies with reasons | Working, five records; keyword and theme rules |
| Comparison | Side-by-side conditions, objectives, and limits | Working, up to three records |
| Numeric exploration | Inspect one real experimental table with provenance | Five-row FLEX sample; expand and verify |
| AI explanation | Answer from retrieved evidence with traceable citations | Not implemented |
| Export | Download a brief and selected data | Working for curated brief and sample CSV |
| Reproducibility | Public source, run instructions, licenses, provenance | Local source and docs ready; public GitHub pending |
| Submission package | Demo URL, page text, videos | Preparation checklist and scripts drafted |

Do not add accounts, collaboration tools, a 3D simulator, universal material risk scores, or live spacecraft telemetry in this sprint. These do not advance the selected user interaction. Do not claim prediction of lunar material safety from a microgravity-only catalog.

## Assign the five people

| Owner | Responsibility | Definition of done |
| --- | --- | --- |
| Coder 1 — data | Download a PSI table and associated documentation; normalize units; record provenance | Reproducible extraction script, reviewed rows, explicit missing values |
| Coder 2 — application | Improve search and comparison; charts; mobile and keyboard usability | One complete demo workflow works on a fresh browser |
| Coder 3 — AI and deployment | Retrieval endpoint, constrained generation, citations, public hosting and GitHub | Answers trace to real passages; secrets stay server-side; failure fallback works |
| Presenter 1 — science and users | Read reports, verify claims, ask a mentor/student to try the workflow | Reviewed evidence cards and notes from at least three trial tasks |
| Presenter 2 — story and submission | Team page, scripts, recording, subtitles, links, organizer confirmation | Submission assets open without requesting access |

Presenters should begin source review and storytelling now, not wait for the application to finish.

## Schedule

| Dhaka date | Finish by the end of the day |
| --- | --- |
| Nov 6 | Confirm local deadline and eligibility; agree on the demo question; assign owners; run this prototype |
| Nov 7 | Import and review one full table; read two associated reports; finalize the evidence schema |
| Nov 8 | Wire retrieval and AI explanation to reviewed passages; keep every claim cited |
| Nov 9 | Integrate the full demo; compare two studies; export a useful brief |
| Nov 10 | Run user/mentor trials; evaluate retrieval and citation quality; fix scientific or usability errors |
| Nov 11 | Record the long demo; prepare the short cut; complete README, data documentation, and project-page draft |
| Nov 12 | Freeze features, check all public links, subtitles, attribution, and submission fields; retain offline backups |
| Nov 13 | Check newly released challenge resources and the confirmed local agenda; make only necessary corrections |

The current [Resources tab](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/?tab=resources) says resources arrive November 13. Existing PSI material is a preparation source, not a claim that the final challenge resource list has been reviewed. Confirm with the Local Lead what may be prepared before the event and accurately disclose pre-event work.

## AI implementation contract

Start small: a curated corpus, simple retrieval, and one server endpoint. A vector database is optional for five to ten studies.

Input: research question, selected investigation IDs, retrieved excerpts, and metadata such as source URL, section/page, test conditions, and whether a passage states a hypothesis, method, or result.

Output:

```json
{
  "answer": "A short explanation limited to the supplied evidence",
  "claims": [{"text": "One supported claim", "source_ids": ["PSI-102:report:section-3"]}],
  "differences": [],
  "limitations": [],
  "missing_evidence": []
}
```

Reject unknown citation IDs. Link each ID to a stored excerpt and its original source. Have a human reviewer check whether the passage actually supports the claim; ID existence alone is insufficient. Return “Insufficient evidence” when appropriate. Distinguish objectives, hypotheses, and observed findings. Calculate plotted values in code from the table, not with the language model. Cache only reviewed demo answers and label them as cached if shown.

Example prompt to adapt and record in the AI log:

> Answer the research question using only the supplied evidence. Separate observed findings from hypotheses, methods, and our interpretation. Cite every substantive scientific claim using a supplied source ID. Do not invent conditions, units, results, or safety thresholds. Report missing evidence and incompatible experimental conditions. If the evidence is insufficient, say so.

## Evidence schema to extend

Store investigation ID, test ID, source URL/DOI, source file and page/section, retrieval date, fuel/material, geometry, gravity regime, oxygen mole fraction, pressure with unit, flow with unit, sensors, measured outcomes with units, uncertainty if reported, missing-data reason, and reviewer status. Use `null` when not known. Preserve raw units alongside normalized units.

## Validation that matters

- Make a small set of ten representative research questions and have the science owner label relevant sources.
- Check top-three retrieval relevance and inspect every citation in the demo answers.
- Try questions with no evidence, unsupported lunar predictions, and deliberately mismatched experiments.
- Verify exported rows against the original table, including empty cells and outcome categories.
- Ask three people to find and compare a study; record completion time and where they get stuck. Report measured results only after testing.

## Why judges should care

The differentiator is a visible chain from question to experiment to source passage to bounded explanation. Demonstrate that chain in the video. A brief that explains uncertainty and redirects the user to stronger evidence is more credible than an unsupported “safe/unsafe” score.
