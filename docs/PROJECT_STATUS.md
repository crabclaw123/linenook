# LineNook — Project Status

**Updated:** October 21, 2026  
**Product:** Browser-based, customizable printable handwriting and prewriting worksheet studio for occupational therapists, teachers, and families.

## Development snapshot

| Workstream | Status | Branch |
| --- | --- | --- |
| Phase 1 — Printable worksheet studio | Merged into `main` | `main` |
| Phase 2 — Clinical/educational customization | Merged into `main`; additional clinical and print review may still be needed | `main` |
| QA — Repeated wrapped phrases and desktop preview | Implemented, screenshot-reviewed; **not yet merged** | `qa/bug-cleanup-1` |
| Phase 3 — Worksheet library | Planned; not implemented | Future feature branches |
| Phase 3 — Shapes, highlighting, mixed practice supports | Newly scoped; **not implemented** | Proposed `feature/visual-practice-tools` |

**Last verified QA checks:** [GitHub Actions — `c80647c`](https://github.com/crabclaw123/linenook/actions/runs/39699402088), **70 tests passed in 13 test files**, lint passed, and production build passed. Passing automated checks and positive screenshots do not establish physical-print fidelity or clinical validation.

## Technology

React + TypeScript + Vite, SVG live preview, Vitest, ESLint, one-page dependency-free vector PDF writer and browser print CSS. Geometry and tracing calculations use physical millimeters. Local settings and up to 20 named presets are stored in the browser; there is no backend or cloud sync.

## Already implemented — Phases 1 and 2 (`main`)

- Worksheet title and practice text editor with reusable starter templates, immediate SVG preview, and PDF/download and print actions.
- Writing-line size presets; row spacing and descender clearance; margin, optional baseline highlight, and even page-height distribution controls.
- Dotted original manuscript glyphs with selective alternate letterforms, case transformations, configurable character spacing (0–8 mm), and row overflow warnings.
- US Letter/A4 paper sizes, several guide-line styles and colors, optional Name/Date fields.
- Four worksheet-wide practice modes — Trace, Copy, Fade and Blank — plus one-letter-per-row prompts and left-handed Copy reference positioning.
- Local draft restoration and named presets; no account required.

These modes are **worksheet-wide** in Phase 2. Per-word, per-span and per-row mixing is a **planned Phase 3 feature**, not a current capability.

## QA improvements implemented — `qa/bug-cleanup-1` (merge pending)

1. **Complete-phrase repetition:** Previously, phrases only repeated when they fit on a single writing line. Trace and Fade now repeat **whole multi-row blocks**, never partially repeating a sentence at the bottom of a page.
2. **Independent practice space:** A new `blankPracticeRows` control reserves writing rows below the model. Settings and saved presets retain the choice.
3. **Practice-mode behavior:** Copy provides one complete wrapped exemplar followed by independent rows; Fade reduces visual guidance across complete repetitions rather than unevenly fading lines within the same copy.
4. **Desktop layout:** The left controls scroll independently, keeping the preview visible. Subsequent layout adjustments reduced the settings column from 402 px to 342 px, enlarged the worksheet preview and trimmed unnecessary padding. Narrow/mobile layouts remain stacked; SVG print/PDF geometry is unchanged.
5. **Regression coverage:** New wrapping, repetition, blank-row, Fade, Copy and PDF-output tests; latest CI passed **70/70** tests, ESLint and build.

**Observed QA:** The user provided screenshots demonstrating full 3-line phrase repetitions, name/date headers and independent scrolling, and approved the revised worksheet/editor proportions. This is browser-based visual feedback, not documented physical-print testing.

**Before merging QA:** Verify that independent panel scrolling is comfortable at short/tall desktop heights; ensure the complete phrase repeats with chosen blank rows, no clipping in A4/Letter PDFs, and desktop changes do not alter the printed sheet.

## Planned next: shapes, selective highlighting and mixed supports

**Recommended feature branch:** `feature/visual-practice-tools` — create **from updated `main` after merging `qa/bug-cleanup-1`**.

- **Prewriting shapes:** Provide a starter selection of paths (straight/curved lines, circles, squares, triangles, simple pathways), with Trace/Copy options and writing-area placement appropriate to printable activities. Shape paths should be reused by SVG preview and PDF.
- **Highlight selected text:** Allow an author to highlight individual words or character ranges (e.g. “The **cat** is small”), with adjustable, accessible print-friendly cues that do not alter the underlying text.
- **Mix practice levels within one page:** Support combinations of Trace, Copy, Fade and blank independent practice across chosen words/text spans and/or rows. Provide obvious controls so users can see exactly what each student will receive.
- **Data/layout design first:** Decide how selections and per-item support are represented in a structured worksheet model, survive edits, line wrapping and full-phrase repetition, and are faithfully serialized in browser presets.
- **QA and acceptance:** Test matching preview and PDF, repeated phrases with mixed-mode segments, highlights on wrapped text, letter spacing, A4/Letter printing, and keyboard-accessible authoring controls. Clinically review whether each support cue communicates its intended task.

**Scope separation:** The existing Phase 3 **worksheet library** plan remains intact: name-writing and sentence-copying activities, letter-formation progressions, themed activities, shareable/exportable presets and reusable templates. The visual-practice tools are a **focused Phase 3 workstream**, not a replacement for that library.

## Open issues / limitations

- Prototype manuscript letterforms are **not certified or independently validated** against any standardized handwriting curriculum; evaluate letter formation and stroke direction clinically.
- No automatic multipage PDF export.
- Some Unicode characters/diacritics are unsupported in tracing and replaced with `?`; PDF title uses a basic built-in font.
- Browser-only presets can disappear if local storage is cleared and do not synchronize across devices.
- Printer margins, scaling and colors vary. Print at **Actual Size / 100%** on the corresponding paper type for physical QA.
- The existing Fade/Copy treatment rules are design decisions, not validated therapy protocols.

## Next steps

1. Finish QA review and merge `qa/bug-cleanup-1` into `main`.
2. Update the local `main` branch after the merge; create `feature/visual-practice-tools` from that merged baseline.
3. Design the mixed-content worksheet data model before building the editor controls; implement shapes and highlights with shared SVG/PDF rendering and tests.
4. Retain the other Phase 3 worksheet-library items in the roadmap for subsequent focused branches.

See [ROADMAP.md](ROADMAP.md) for the complete phase-by-phase checklist.
