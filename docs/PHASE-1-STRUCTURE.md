# Phase 1 — Navigation & Page Structure

## Implemented
- Main navigation now exposes only Learning Assistant and Model Explorer.
- Added a third lightweight navigation anchor: “ทำไมต้อง Multi-Agent?” which scrolls to the comparison section on the homepage.
- Added `models.html` as the dedicated Model Explorer page.
- Kept `agents.html` as a compatibility redirect to `models.html`.
- Preserved original font choices and the visual language of cards, rounded controls, workflow stepper, and accent color.
- Kept all files at repository root for GitHub Pages root deployment.

## Files
- Updated: `index.html`, `style.css`
- Added: `models.html`, `models.js`
- Compatibility: `agents.html`

## Acceptance
- Two primary destinations only.
- No client-side router or build step.
- All navigation uses relative paths or in-page anchors.
