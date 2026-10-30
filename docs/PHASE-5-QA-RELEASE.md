# Phase 5 — QA & GitHub Pages Readiness

## Static checks completed
- HTML pages reference local CSS and JavaScript files using relative paths.
- Scripts are loaded after page markup.
- No package manager, bundler, or build step is required.
- No API keys or secrets are included.
- `agents.html` preserves old inbound links through redirect.
- Main page has mobile breakpoints and reduced-motion support.
- External links use `target="_blank"` with `rel="noopener noreferrer"`.

## Manual tests still required in a real browser
- Submit Thai and English topics.
- Confirm Wikipedia search and extract requests succeed.
- Test no-result and offline/network-failure states.
- Test copy/download actions on HTTPS GitHub Pages.
- Check navigation anchors on both pages.
- Inspect mobile and desktop layouts.
- Check browser console and network panel.

## Release instructions
1. Extract the project folder contents into the root of the GitHub repository.
2. Commit and push to the branch configured for GitHub Pages.
3. In repository Settings → Pages, select `main` and `/ (root)` if not already configured.
4. Wait for GitHub Pages deployment and test the published URL.

## QA honesty
Automated static checks do not replace browser testing. No claim is made that the live GitHub Pages deployment has been tested from this environment.
