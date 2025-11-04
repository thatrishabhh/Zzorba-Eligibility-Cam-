import { initPdfLogic } from './pdf.js';

/* ---------- DOM short-cuts ---------- */
const qs = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- Dialog helpers ---------- */
function openDialog(d) { d.removeAttribute('inert'); d.showModal(); }
function closeDialog(d) { d.setAttribute('inert', ''); d.close(); }

/* Info dialog */
const infoDialog = qs('#infoDialog');
qs('#infoBtn').addEventListener('click', () => openDialog(infoDialog));
infoDialog.addEventListener('click', e => {
    if (e.target.dataset.closeDialog !== undefined || e.target === infoDialog) closeDialog(infoDialog);
});

/* Results dialog */
const resultsDialog = qs('#resultsDialog');
resultsDialog.addEventListener('click', e => {
    if (e.target.dataset.closeDialog !== undefined || e.target === resultsDialog) closeDialog(resultsDialog);
});

/* ---------- Form Logic (simplified for brevity) ---------- */
import { validateForm, runEligibility } from './logic/eligibility.js';

qs('#calcBtn').addEventListener('click', async () => {
    const form = qs('#eligibilityForm');
    const data = validateForm(form);
    if (!data.valid) return;                 // early exit: invalid
    const results = runEligibility(data);    // heavy logic in separate module
    renderResults(results);
    openDialog(resultsDialog);
});

/* ---------- PDF (lazy-loaded) ---------- */
qs('#downloadPdfBtn').addEventListener('click', async () => {
    const { generatePdf } = await import('./pdf.js');
    generatePdf(document.querySelector('#resultsBody'));
});

/* ---------- Accessibility & UX ---------- */
/* trap focus inside open dialog, Esc to close, etc. (implementation skipped) */