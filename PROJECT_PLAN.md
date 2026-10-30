# Agent Loop Playground — Project Plan

## Product direction
A focused MVP for a public Live Demo on GitHub Pages. Preserve the existing design language and working functionality while narrowing the product to two main pages.

**Core message:** The right workflow can matter as much as the model itself.

Multi-Agent is not always better than Single AI. The project explains when role separation can help organize complex tasks, while acknowledging extra latency, complexity, and cost.

## Information architecture
1. **Learning Assistant (`index.html`)**
   - Hero and prompt input
   - Example prompts
   - Agent workflow status
   - Result, process trace, study sheet, source link
   - Single AI vs Multi-Agent comparison below the chat/result area
   - Navigation anchor scrolls to the comparison; no intrusive popup
2. **Model Explorer (`models.html`)**
   - Six categories, 2–3 model families per category
   - Compact cards: provider, fit, strengths, caveat, official documentation
   - No universal leaderboard or unverified prices/benchmarks

### Model categories
1. Learning & Research
2. General Chat
3. Coding & Development
4. Data Analysis
5. Long Context & Documents
6. Creative & Multimodal

## Technology constraints
- HTML, CSS, Vanilla JavaScript
- GitHub Pages static hosting; no build step
- No backend, authentication, cloud sync, or API key in frontend
- Reuse existing design language: Bricolage Grotesque, IBM Plex Sans Thai, purple/blue accent, cards, workflow stepper
- Keep relative links and script order compatible with repository-root GitHub Pages

## File structure
```text
agent-loop-playground/
├── index.html
├── models.html
├── agents.html             # legacy redirect
├── style.css
├── app.js
├── agents.js               # legacy file retained only if needed by old deployments
├── tools.js
├── data.js
├── models.js
├── README.md
├── PROJECT_PLAN.md
└── docs/
    ├── PHASE-0-AUDIT.md
    ├── PHASE-1-STRUCTURE.md
    ├── PHASE-2-LEARNING-ASSISTANT.md
    ├── PHASE-3-SINGLE-VS-MULTI.md
    ├── PHASE-4-MODEL-EXPLORER.md
    └── PHASE-5-QA-RELEASE.md
```

## Truthful demo labels
- LIVE: Wikipedia search/extract, browser-side rule-based analysis, sheet generation, Markdown export, navigation.
- DEMO: educational workflow visualization of the rule-based agents.
- PLANNED: LLM-backed agents, multi-source research, backend, login, cloud sync, conversation memory, benchmark experiments.

Never claim the five agents are independent LLMs. Never invent performance scores. Reviewer performs structural checks only, not semantic fact verification.

## Phase roadmap
- Phase 0: audit old project, preserve UI and working behavior, define change list.
- Phase 1: two-page navigation and static page structure.
- Phase 2: improve Learning Assistant, workflow trace, result states and export.
- Phase 3: add Single AI vs Multi-Agent explainer below the main interaction with an anchor link.
- Phase 4: build compact six-category Model Explorer.
- Phase 5: test links, interactions, mobile layout, error handling, and GitHub Pages readiness.

See `docs/PHASE-*.md` for implementation notes and acceptance criteria.
