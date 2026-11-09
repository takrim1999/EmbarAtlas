# AI usage and source register

## AI disclosure — current prototype

Codex was used on November 6, 2026 to research the challenge and supplied manual, propose a product scope, write application code and tests, draft source summaries, and create planning documents. The user requested help understanding Flame in Freefall, choosing a product, and preparing for the November 12–13 deadline window with three coders and two presenters.

AI operated on the linked challenge, the participant guide, public NASA PSI records, and the local workspace. Both supplied links were subsequently opened in a real browser; the challenge's rendered Details and Resources tabs and the manual's video requirement tables and pitch graphics were inspected. Earlier retrieval used search and a direct Google Docs text export.

All scientific summaries still need team review against the original sources. No team member has yet been represented as having completed that review. No private user files were added to the corpus.

The browser application has **no model API calls**. Its search is keyword/theme ranking; its brief is assembled from fixed summaries. The product should not be pitched as a working AI dashboard until the planned inference layer is implemented and evaluated.

For each later model call, record the provider/model, purpose, prompt version, input source IDs, output, reviewer, and corrections. Also disclose AI-assisted development separately from AI features in the application.

## Sources

| Source | Use in this prototype |
| --- | --- |
| [Flame in Freefall](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/) | Scope, target users, scientific boundaries |
| [Challenge Resources](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/?tab=resources) | Resource-release status checked November 6 |
| [Bangladesh participant guide](https://docs.google.com/document/d/1mSOxplyht5kii8GcCnFaGA-vMHIAVypjl4N6PobnaYQ/edit?tab=t.0) | Local deliverables and provisional timetable |
| [Official 2026 event](https://www.spaceappschallenge.org/2026/) | Global timeline cross-check |
| [BASS-II / PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) | Objectives metadata; DOI 10.60555/4qc4-de67 |
| [Saffire-I / PSI-98](https://psi.nasa.gov/physci/repo/data/investigations/PSI-98) | Objectives/approach metadata; DOI 10.60555/0t15-1z43 |
| [SAME / PSI-102](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102) | Objectives/approach metadata; DOI 10.60555/gd4k-8h62 |
| [SAME-R / PSI-101](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101) | Objectives/approach metadata; DOI 10.60555/2np7-jv14 |
| [FLEX / PSI-69](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69) | Objectives and displayed experimental-table rows 1–5; DOI 10.60555/mbq8-0451 |

Access/review date: November 6, 2026. Record page/section references more precisely when importing reports. The current PSI record summaries were retrieved through web search; numeric FLEX values were transcribed from its rendered search representation of the experimental table. They have not been independently checked against a downloaded original table.

## Transformations

- Source descriptions were paraphrased into short metadata cards.
- Prevention/detection/suppression and fuel tags are team-curated navigation labels.
- Rank is a transparent theme/keyword rule, not a NASA ranking.
- FLEX field labels were normalized into JavaScript property names, while units and test IDs were retained.
- Empty extinction diameter for 30CAL02 became `null`; CSV writes an empty field and the UI displays a dash.
- The ambiguous displayed “burning rate” field was omitted rather than guessing its unit.
- No fitted curve, simulation, learned scientific model, or uncertainty estimate was introduced.

Original code and vector/CSS artwork were created for this project. Typography uses DM Sans and Manrope via Google Fonts. Additional images, report figures, or publications require their own attribution and license review if incorporated later.
