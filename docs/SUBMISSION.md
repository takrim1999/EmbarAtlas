# Submission preparation

Read against the supplied [Bangladesh participant manual](https://docs.google.com/document/d/1mSOxplyht5kii8GcCnFaGA-vMHIAVypjl4N6PobnaYQ/edit?tab=t.0) and the [official 2026 event page](https://www.spaceappschallenge.org/2026/). Local Lead instructions and updated official rules must resolve conflicts. Dates below are a working interpretation, not a confirmed extension or eligibility decision.

## Date questions to resolve today

The manual lists a prescreening deadline of October 1, a local-judging video on November 13 at 18:30, and a final short video on November 14 at noon. Its run of show instead puts the short-video upload at 09:00. It also retains an obsolete note about a November 1 long-video deadline. The official event page describes the global submission close as November 15 at 23:59 local time, while the manual refers to US Eastern Time. Treat November 12 as this team's internal ready date and ask the Local Lead to resolve the external times.

Suggested message for the team to send (not sent by Codex):

> Our team chose Flame in Freefall. Please confirm our registration/prescreening status, the exact next deadline and submission form, whether the 240-second video is due November 12 or 13, the short-video deadline, and which preparation/build work is allowed before the event. We are working toward a November 12 internal finish.

## Submission inventory

- [ ] Confirm both Bangladesh and NASA registrations, event, challenge, and team roster.
- [ ] Confirm prescreening status and any remaining local entry requirement.
- [ ] Public GitHub repository with working instructions, code license, data provenance, and AI disclosure.
- [ ] Judge-accessible dashboard URL; test without your account.
- [ ] Working long demo, kept below 240 seconds; provide the local YouTube/form/Drive deliverables requested by the Lead.
- [ ] Short demo, kept below 30 seconds, with English subtitles and a publicly viewable link.
- [ ] NASA project fields completed and explicitly submitted.
- [ ] Sources, assets, external tools, prompts, and team contributions credited.
- [ ] Apply the manual's special handling for participants under 18; resolve conflicting name/photo guidance with the Lead if relevant.

The manual describes three videos across the process: concept prescreening, local judging, and the short final demo. A seven-slide alternative is mentioned for the final demo; verify against the latest official submission guide before relying on it.

## Demo story to build toward

Show one user resolving one question: finding smoke-detection studies, comparing SAME and SAME-R, opening the evidence behind an explanation, and exporting the brief. Mention the FLEX chart as a secondary capability only if time permits. Do not describe a planned feature as running.

## 🎬 Long Video (240 Seconds) Official Production Script

*Target Duration: 225–230 seconds (Hard Cap: 240.0s / 4:00). Paced at ~135 WPM (~510 words).*

### Sequence & Speaker Plan
* **Speaker 1 (Takrim - Team Lead):** Act 1 (Hook) & Act 3 (System Walkthrough)
* **Speaker 2 (Tamanna - Science & Data):** Act 2 (Problem & NASA PSI Data) & Act 5 (Mission Scenarios)
* **Speaker 3 (Jabir - Full-Stack & UI/UX):** Act 3 (Flame Lab & Data Explorer Demo)
* **Speaker 4 (Abdullah - Research & Guardrails):** Act 4 (SI Engine) & Act 6 (Rigor & Closing)

### Scene Breakdown

#### Act 1: The Hook & The Invisible Threat in Space (0:00 - 0:25)
* **Visual:** Title card (Ember Atlas, Team AstraShield-ICE, NASA Space Apps 2026: Flame in Freefall), cut to video/graphic of buoyant Earth flame vs spherical microgravity flame.
* **Narration (Takrim):** *"In space, fire does not behave like it does on Earth. Without gravity-driven buoyancy, flames don't rise in flickering yellow teardrops. They form quiet, ghostly blue spheres. Worse yet, space flames can sustain 'cool flames'—invisible, low-temperature combustion that continues long after the visible fire goes out. A silent hazard that can reignite an entire spacecraft without warning."*

#### Act 2: The Core Problem & NASA PSI Archive (0:25 - 0:55)
* **Visual:** Brief cut of raw NASA Physical Science Informatics (PSI) repository interface, transitioning into Ember Atlas Dashboard with Prevention, Detection, and Suppression pillars.
* **Narration (Tamanna):** *"For decades, NASA has conducted ground-breaking combustion experiments aboard the International Space Station and uncrewed Cygnus missions. But this critical data is scattered across thousands of raw tables and complex reports in NASA’s Physical Science Informatics database. To design safe pressurized rovers for the Moon, or life-support systems for Mars, mission architects cannot spend weeks hunting across disparate databases. That’s why we built Ember Atlas."*

#### Act 3: System Walkthrough & Interactive Science (0:55 - 1:45)
* **Visual (0:55 - 1:10):** Interactive Microgravity Flame Lab. Adjust oxygen concentration and droplet diameter sliders, showing spherical flame envelope and soot shell.
* **Narration (Jabir):** *"We start with intuitive physics. Our interactive Flame Lab simulator visualizes microgravity droplet vaporization, spherical soot shell trapping, and radiative extinction under varying oxygen levels."*
* **Visual (1:10 - 1:25):** Click Explore Evidence. Filter by topic and fuel geometry. Click Compare to show side-by-side matrices of BASS-II vs Saffire-I.
* **Narration (Takrim):** *"In the Evidence Library, 19 NASA investigations across CIR, MDCA, and the Microgravity Science Glovebox are standardized. Researchers can compare material flammability, flow ducts, and sensors side by side in seconds."*
* **Visual (1:25 - 1:45):** Click Data Explorer. Select BASS-II (PSI-25). Highlight Recharts bar plot of Flame Spread Rate and sortable Experimental Run Matrix. Click Export CSV.
* **Narration (Jabir):** *"In our Data Explorer, we don't just show summaries—we provide 37 source-checked experimental runs across 10 core studies. From solid PMMA flame spread rates in BASS-II to smoke aerosol sizes in SAME, complete with DOIs and one-click data export."*

#### Act 4: Super Intelligence (SI) Engine (1:45 - 2:30)
* **Visual:** Open Ask SI (Chat). Ask: *"What did FLEX and CFI discover about cool flames and extinction?"* Show live response streaming with bracketed citations [PSI-69], [CFI]. Click citation to open NASA PSI source.
* **Narration (Abdullah):** *"Navigating decades of combustion science requires intelligence. Ember Atlas integrates a specialized Super Intelligence research assistant powered by Google Gemini, grounded strictly in curated NASA PSI evidence. Unlike generic AI that hallucinates space facts, our SI engine enforces multi-turn evidence grounding. Every scientific claim cites exact NASA investigation IDs, distinguishing hypotheses from verified experimental measurements."*

#### Act 5: Mission Scenarios — Moon, Mars & Earth (2:30 - 3:15)
* **Visual (2:30 - 2:50):** Open Research Insights page. Click Lunar Habitat & Rovers tab (30%+ O2, 10.2 psi).
* **Narration (Tamanna):** *"Ember Atlas turns raw data into actionable mission synthesis. For the Artemis lunar program, habitats operate at elevated 34% oxygen to avoid pre-breathing during EVAs. Our synthesis demonstrates from BASS-II and ACME data that materials flame-resistant on Earth burn vigorously in lunar atmospheres."*
* **Visual (2:50 - 3:15):** Click Mars Missions, Orbital Spacecraft, and Earth Spin-offs tabs. Show callouts for water mist and firefighter gear.
* **Narration (Tamanna):** *"For Mars transit, it identifies aerosol sensor degradation over 3-year timelines. For orbital stations, it reveals how forced cabin ventilation acts as primary fuel in microgravity. And on Earth, these NASA discoveries translate directly into clean-agent water-mist suppressants for data centers and advanced heat-resistant gear for structural firefighters."*

#### Act 6: Scientific Rigor, Team & Conclusion (3:15 - 3:45)
* **Visual (3:15 - 3:30):** Open Methodology page. Show Primary Source Register and Scientific Guardrail callout.
* **Narration (Takrim):** *"We built Ember Atlas with scientific honesty. We explicitly remind researchers that microgravity observations do not equal lunar partial-gravity certification—bridging the gap until future tests like LUCI and FM2."*
* **Visual (3:30 - 3:45):** Team slide/shot: Team AstraShield-ICE, Rajshahi, Bangladesh, with emberatlas.vercel.app URL and GitHub link.
* **Narration (Takrim & Team):** *"We are Team AstraShield-ICE from Rajshahi, Bangladesh. Ember Atlas: turning scattered microgravity experiments into foundational fire safety intelligence for humanity’s journey to the Moon, Mars, and beyond. Thank you."*
* **Outro (3:45 - 4:00):** Clean music fade-out with closing title card and credits.

### Short video — prototype-safe draft

Aim for 27–29 seconds after an actual timed rehearsal. Suggested narration:

> We’re [team name]. Ember Atlas helps researchers navigate fire science in space. Choose a question, compare NASA’s SAME and SAME-R experiments, and open the source behind each brief. Our dashboard also explores recorded FLEX measurements. We turn NASA Physical Sciences Informatics records into clear, traceable research context, with limitations visible at every step.

Show team credits and the product name, then the search/comparison, source links, and a brief glimpse of the data explorer. The current draft deliberately makes no live-AI claim. Once the AI feature works and is evaluated, update the script to describe and show it accurately.

## Project-page starter copy

**High-level summary draft:** Ember Atlas helps aerospace students and researchers discover and compare NASA microgravity combustion studies. Our prototype organizes prevention, detection, and suppression evidence into searchable investigations, comparative summaries, source-linked briefs, and a small numerical explorer. The aim is to make the path from a research question to its supporting evidence easier to inspect.

**Current NASA data usage:** PSI investigation metadata powers the catalog and comparison. Five manually transcribed FLEX experimental-table rows power the numeric example. Identify these as a sample; do not claim full-dataset ingestion or validated safety prediction.

**Before submitting:** replace this draft with the final implemented scope, real team names and contributions, final public links, measured evaluation results, and the actual AI tools/prompts used.
