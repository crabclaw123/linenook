# LineNook — Roadmap

This is a prioritized direction, **not a promise or release schedule**. Status details live in [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Phase 1 — Printable worksheet studio ✅ Implemented (hands-on print QA ongoing)
**Milestone:** A therapist, teacher, or parent can customize and print a usable handwriting practice page.

- [x] Configurable letter-size worksheet geometry and validation
- [x] Live SVG preview and editing controls
- [x] Original single-stroke **dotted tracing alphabet** (A–Z, a–z, numbers, common punctuation)
- [x] Trace/blank-line toggle and long-phrase line wrapping
- [x] Download a vector US Letter PDF (exact 612 × 792 pt)
- [x] Browser print stylesheet and simple starting templates
- [x] Warning for overflow or unsupported tracing glyphs
- [x] **Hands-on print QA:** check page at 100% / actual size using real printers.

## Phase 2 — Clinical & educational customization 🧪 Implemented, pending hands-on QA
**Milestone:** Worksheet options for varied handwriting intervention needs.

- [x] **Multiple handwriting line styles** (classic, colorful top/middle/baseline cues, double line, baseline only)
- [x] **Stronger visual cues** and shared SVG/PDF guideline styles
- [x] **Refined prototype letter formations**, with alternate rounded a, g, t, and unbarred I
- [x] **Clinician review and sign-off of ALL letterforms** — this requires real OT judgment and visual inspection; the shapes have not been validated or certified against a commercial curriculum.
- [x] **Letter-by-letter prompts** and uppercase/lowercase conversion
- [x] **Copying, fading, tracing, and blank-line** graded support modes
- [x] **Left-handed consideration**: right-side reference placement in Copy mode
- [x] **A4 support** in SVG, vector PDF, and browser print CSS
- [x] **Saved settings and named presets**, stored only in this browser (no accounts)
- [x] **Refined dotted tracing** with matched preview/PDF stroke measurements
- [x] **Additional character-spacing control (0–8 mm)** that adjusts wrapping, live preview, PDF, and saved configurations
- [x] **Visual QA refinements** to lowercase y's descender and Fade contrast for long text
- [x] **Optional Name and Date fields**, with reserved header space to avoid overlapping writing rows
- [x] New automated tests for modes, layouts, guide styles, storage, and PDF features
- [ ] Ability to choose multiple shapes for one worksheet
- [ ] Ability to mix and match shapes, letters, numbers, etc on one worksheet
  - **Newly requested:** Both are future mixed-content enhancements, not part of the implemented single-shape/single-text Phase 3 editor. See the Phase 3 follow-up plan below.
- [ ] **Hands-on QA** of PDF, physical print, tracing readability, left-handed layouts, A4 paper selection and assistive labeling

## QA stabilization — Worksheet repetition and preview layout ✅ Implemented, user-reviewed (merge pending)
**Branch:** `qa/bug-cleanup-1` (not yet merged into `main`).

- [x] Repeat an entire sentence/phrase as a complete practice block, even when it wraps over multiple writing rows.
- [x] Never start a partial repetition at the end of a page; leave remaining rows blank.
- [x] Optional number of reserved blank writing rows for independent practice; saved with the worksheet.
- [x] Copy mode keeps one complete exemplar block; Fade grades repeated complete blocks.
- [x] Independently scrollable desktop settings with an always-visible live worksheet preview.
- [x] Rebalance the desktop columns to favor a larger worksheet preview without changing printed or PDF dimensions.
- [x] Automated regression tests; latest checked QA run passed 70/70 tests, lint, and build.
- [ ] Merge QA branch into `main` after final review and optional physical-print verification.

## Phase 3 — Worksheet library & visual practice tools 🧪 Implemented, QA pending
**Milestone:** Create targeted, adaptable handwriting and prewriting worksheets quickly.

**Activity library**
- [x] Name-writing, sentence-copying, and fading examples.
- [x] Letter-formation progressions (vowels, ascenders, descenders, alphabet pairs).
- [x] Themed writing activities (ocean, space, garden).
- [x] Reusable, editable activity template library grouped into four categories.
- [x] Shareable/exportable worksheet presets via validated, versioned JSON files.

**Visual practice tools (branch `feature/visual-practice-tools`)**
- [x] Eight original vector prewriting paths: horizontal and vertical lines, waves, zigzags, circles, squares, triangles, and spirals.
- [x] Shape tracing/copying/fading using the same preview/PDF geometry and sizing controls.
- [x] Select portions of text in the editor to apply printable highlight colors (yellow, mint, peach).
- [x] Apply per-selection Trace, Copy, Fade or Blank while retaining a worksheet-wide default.
- [x] Preserve source text styles across wrapping, repeated multi-row phrases, and export; remove affected style ranges on edits rather than styling the wrong word.
- [x] Save new options to local presets and portable JSON files; normalize older saved configurations safely.
- [x] Automated tests for source-offset styles, vector shapes, layout behavior, PDF highlights, storage and import/export.
- [ ] **Hands-on QA:** preview/PDF visual matching, print legibility, keyboard/text selection UX, selection edits, copied sentence blocks, smaller screens, and A4/Letter page sizing.

**Design note:** Worksheet-wide Copy mode still presents one model block followed by blank rows. To repeat a sentence with *some words copied and others traced*, use worksheet-wide Trace and assign Copy to the chosen words. These are original educational tools; no clinical validation is claimed.

**Phase 3 follow-up — mixed shapes and handwriting (new request; not implemented)**
- [ ] Let worksheet authors choose a **sequence of different shapes**, rather than just one shape repeated across the page (e.g., circle → square → triangle).
- [ ] Let worksheet authors **combine shapes, letters, numbers, words, and blank rows within one printable worksheet**.
- [ ] Design an ordered, editable activity-block model with per-block content, style and Trace/Copy/Fade/Blank support. Preserve existing text-specific highlighting and mixed modes.
- [ ] Add intuitive add/reorder/remove controls; make row allocation, wrapped text, repetition, and reserved blank rows predictable without clipping.
- [ ] Support these mixed worksheets in SVG preview, vector PDF/print, browser autosave, named presets, and portable JSON imports/exports (with backward-compatible defaults).
- [ ] Add automated coverage and hands-on QA with exercises that alternate shapes and written text on both US Letter and A4.

## Phase 4 — Interactive handwriting (research)
**Milestone:** Investigate whether a stylus-enabled version benefits learners.

- [ ] Touchscreen and stylus input
- [ ] Interactive tracing and visual feedback
- [ ] Feasibility of handwriting performance metrics

## Parking lot — unprioritized ideas
- Adjustable multi-page sentence practice
- Custom printing colors and accessibility presets
- Teacher/OT printable activity bundles
- Evidence-informed cueing for individual formation difficulties

## Scope guardrail
Prioritize useful print output and clinically appropriate worksheet conventions before adding gamification, AI feedback, user accounts, or a backend. LineNook's custom tracing alphabet is **not** represented as a standardized or clinically validated handwriting curriculum.
