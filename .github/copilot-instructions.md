<!-- .github/copilot-instructions.md - guidance for AI coding agents working on this repo -->
# Quick orientation
- Purpose: a small static web app (single-page eligibility calculator + PDF export) built with plain HTML, CSS and ES modules. No build system or package manager is present.
- How this repo is used: open `Combined Cam.html` (or other root HTML files) in a browser or serve the folder as static files.

# Big-picture architecture (what to read first)
- UI shells: `Combined Cam.html`, `Example CAM.html`, and other root HTML files contain the page markup, CSS variables, and the main form markup.
- JS entry points: see `Example/app.js` for the app wiring pattern (DOM helpers, event listeners, lazy imports). Heavy logic lives in module files imported from these entry points (look for `import './logic/...'` and `import('./pdf.js')`).
- PDF: the app uses CDN libraries (`jspdf` and `html2canvas`) and a `pdf.js` module to generate downloadable PDFs of the results.

# Data flow and component boundaries
- Form -> validation -> eligibility logic -> render -> PDF
  - User fills a form in the HTML (selector `#eligibilityForm`).
  - `validateForm(form)` (implemented in `./logic/eligibility.js`) normalizes and validates inputs and returns an object with a `valid` flag.
  - `runEligibility(data)` performs the core calculation and returns a results object that is rendered into `#resultsBody` and shown via the `#resultsDialog` dialog.
  - PDF export lazily imports `pdf.js` and calls `generatePdf(document.querySelector('#resultsBody'))`.

# Project-specific patterns and conventions
- DOM helpers: `qs(selector, context)` and `qsa(selector, context)` are used across modules — prefer them for concise DOM access.
- Dialogs: the code uses native `<dialog>` elements with `showModal()` / `.close()` and an `inert` attribute. Look for `data-close-dialog` attributes as the click target to close dialogs.
- Lazy-loading: heavy features (PDF generation) are imported dynamically via `await import('./pdf.js')`. Keep the same relative import pattern for optional features.
- Styling: CSS variables are centralized at the top of `Combined Cam.html` and reused; avoid duplicating color values — update the root `:root` block when adding theme colors.
- Filenames: many files use spaces and inconsistent casing (e.g., `Example CAM.html`, `ELIGIBILTY CAM/`). When creating or referencing files from JS imports or HTML `src`/`href`, use URL-encoded or normalized names and prefer kebab-case for new files to avoid path/case issues.

# Integration points & external dependencies
- CDN-hosted libraries in the HTML head: Google Fonts, FontAwesome, Animate.css, jspdf, and html2canvas. Do not remove these CDNs unless you add a replacement local dependency.
- Internal modules: `./pdf.js`, `./logic/eligibility.js`, and `Example/app.js`. Search for `import` statements to find module boundaries.

# How to run & debug (concrete)
- Quick: open `Combined Cam.html` in your browser. If modules fail to load due to CORS/file:// restrictions, serve the folder with a static server. Example PowerShell commands from repo root (c:\Users\user\.anaconda\Cam):
  - python -m http.server 8000
  - or use an editor Live Server extension to serve the folder

- Debugging tips:
  - Open DevTools Console to see module import errors (missing `./logic/eligibility.js` path typos are common).
  - Check network panel for CDN loads (jspdf/html2canvas). If CDNs block, consider temporarily adding local copies into `Example/`.

# Editing guidance for common tasks (concrete examples)
- Add a new input field to the eligibility form:
  1. Update the HTML form markup in `Combined Cam.html` (find `#eligibilityForm`).
  2. Update `validateForm(form)` in `./logic/eligibility.js` to parse/validate the new field and include it in the returned data object.
  3. Update `runEligibility(data)` to use the new field when calculating results.
  4. Update rendering code that populates `#resultsBody`.

- Add a new optional export feature: follow the existing `#downloadPdfBtn` pattern — keep the button in HTML and lazy-import `./pdf.js` from the click handler.

# Common pitfalls an AI agent should avoid
- Changing CDN URLs or removing script tags in the `<head>` without adding replacements — PDF generation and fonts depend on them.
- Renaming files carelessly: some code references filenames with spaces and case-sensitive paths; prefer adding new files with safe names and updating imports accordingly.
- Editing inline CSS variables without searching the repo — many styles rely on `:root` variables defined in `Combined Cam.html`.

# Quick file pointers (where to look first)
- `Combined Cam.html` — main UI, CSS variables, forms, and script tags.
- `Example/app.js` — idiomatic JS helpers, event wiring, and lazy import examples.
- `pdf.js` — PDF generation logic; invoked lazily from UI.
- `logic/eligibility.js` (if present) — core business rules for eligibility; primary place for calculation changes.

# When unsure, ask for these clarifications
- Which HTML file is the canonical entry (there are many similar root HTML files)?
- Is there an intended naming/casing convention for new files (repo currently inconsistent)?

---
If you'd like, I can open the files referenced above, extract exact function signatures (e.g., the shape returned by `validateForm`) and add a short API contract to the top of this file.