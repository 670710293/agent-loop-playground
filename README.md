# Agent Loop Playground

A focused, two-page learning demo that illustrates how a role-based agent workflow can organize a research-and-learning task.

## Live demo -->  https://670710293.github.io/agent-loop-playground/
Deploy this repository with GitHub Pages (Settings → Pages → Deploy from branch → `main` → `/ (root)`).

## Pages
- `index.html` — Learning Assistant, Agent Workflow, study sheet output, and the Single AI vs Multi-Agent explainer.
- `models.html` — AI Model Explorer with six task categories and a small curated set of model families.
- `agents.html` — compatibility redirect to `models.html` for old links.

## How the demo works
1. Planner extracts a topic and detects the language.
2. Researcher searches and fetches an article introduction from Wikipedia's public API.
3. Analyst applies deterministic, browser-side text heuristics.
4. Writer assembles a Markdown study sheet.
5. Reviewer checks basic structural criteria (minimum number of points/keywords and an HTTPS source URL).

**Important:** These are rule-based JavaScript workflow roles, not five independent LLMs. Wikipedia is the live external data source. Analysis, sheet generation, and review are deterministic browser logic. The Reviewer does not fact-check claims semantically. The comparison section is educational, not a measured benchmark.

## Run locally
Use a local static server (recommended):
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

No build step or package installation is required.

## Files
- `index.html`, `models.html` — two main pages
- `style.css` — design system and responsive layout
- `app.js` — Learning Assistant UI and workflow
- `tools.js` — Wikipedia API and local text analysis
- `data.js` — Agent definitions and model-family catalogue
- `models.js` — Model Explorer rendering
- `docs/` — phase-by-phase planning and implementation reports

## Limitations
- Wikipedia is the only live research source.
- Search and extract availability depend on the external API and network.
- Text analysis uses heuristics and is not equivalent to an LLM summary.
- Model Explorer describes model families, not a live model ranking, benchmark, or price comparison. Check official documentation for current model versions and capabilities.
- No backend, authentication, cloud sync, conversation history, or real LLM provider is included.
- No API keys or secrets are required in the frontend.

## Future development
Possible next steps include adding approved research providers, real server-side LLM adapters, conversation persistence, a fact-checking reviewer, and controlled Single AI vs Multi-Agent evaluations using a shared task set and transparent metrics.

See `PROJECT_PLAN.md` and `docs/PHASE-*.md` for the roadmap and implementation notes.
