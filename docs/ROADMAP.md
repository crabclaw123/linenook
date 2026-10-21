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
- [ ] **Hands-on QA** of PDF, physical print, tracing readability, left-handed layouts, A4 paper selection and assistive labeling

## Phase 3 — Worksheet library
**Milestone:** Create targeted worksheets in under a minute.

- [ ] Name-writing templates and sentence-copying pages
- [ ] Letter formation progression and themed activities
- [ ] Shareable/exportable presets
- [ ] Reusable activity templates
- [ ] Option to highlight chosen parts of worksheet (e.g, "The cat is small", being able to highlight "cat")
- [ ] Combining trace, copy, fade on one worksheet (e.g., "the cat is small" copy "the, is, and small" trace cat)

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
