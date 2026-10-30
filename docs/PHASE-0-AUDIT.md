# Phase 0 — Project Audit & Architecture

## Input inspected
Original ZIP: `agent-loop-playground-v5.zip`.

Files found:
- `index.html`, `agents.html`
- `style.css`
- `app.js`, `agents.js`, `tools.js`, `data.js`
- `README.md`, `.gitignore`

## Findings
- The original site is a static HTML/CSS/JavaScript project with no build step.
- `index.html` already contains a working prompt flow, a five-step agent visualization, a trace panel, a study sheet, and Markdown export.
- `tools.js` calls Wikipedia's public API and performs browser-side deterministic text analysis.
- `agents.html` combines agent descriptions and a small model catalogue in tabs.
- The original visual language uses Bricolage Grotesque, IBM Plex Sans Thai, purple accent, rounded cards, and a horizontal workflow stepper.
- Agent logic is rule-based. It does not call independent LLMs.
- The original Model catalogue describes broad model/provider families, not measured rankings.

## Architecture decision
Keep the static architecture and visual identity. Use two main pages:
1. `index.html`: Learning Assistant + Single AI vs Multi-Agent explainer.
2. `models.html`: Model Explorer.

Retain `agents.html` as a compatibility redirect for old links. Reuse and improve existing `app.js`, `tools.js`, `data.js`, and `style.css`; add `models.js`.

## Risks
- Wikipedia API availability and CORS/network conditions are external dependencies.
- Thai tokenization quality depends on browser support for `Intl.Segmenter`.
- Browser-side heuristic summarization is not semantic fact-checking.
- Model capabilities can change; official docs must be checked before making version-specific claims.

## Phase 0 outcome
Audit completed. The implementation proceeds without introducing a framework, build tool, backend, API key, or new runtime dependency.
