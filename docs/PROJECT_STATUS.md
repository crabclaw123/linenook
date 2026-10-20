# LineNook — Project Status

LineNook makes customizable, printable handwriting worksheets for OTs, teachers, and families.

## Stack
React, TypeScript, Vite, Vitest, ESLint, SVG. No backend; the single-page vector PDF export has **no added dependencies**.

## Branch
`feature/worksheet-studio` — leave `main` unchanged pending testing and review.

## Phase 1 — Feature implementation complete, pending QA
- Reusable millimeter-based worksheet layout and input validation.
- US Letter SVG preview, title and editable phrase.
- Integrated writing-line size and row-gap controls, with automatic row-height calculations and descender clearance.
- Compact / Everyday / Extra room sizing presets (not standardized curriculum dimensions).
- Optional even page-fill that uses extra inter-row space without stretching writing height; enlarged preview and collapsible settings.
- Original vector single-stroke dotted alphabet for uppercase/lowercase A–Z, digits, and common punctuation; clips at page margins.
- Short phrases repeat on each line; long phrases wrap and report overflow.
- Optional blank guidelines, optional highlighted baseline.
- Ready-made name, letter, number, sentence, and greeting presets.
- PDF download exports vector guidelines and tracing on a 612 × 792 pt Letter page.
- Dedicated print stylesheet prints the worksheet without the web UI.
- Unit tests cover geometry, wrapping, common glyphs, sizing/gap safety, even page-fill, and PDF format/content.
- New roadmap is in [ROADMAP.md](ROADMAP.md).

## Release checks
Run `npm run test:run`, `npm run lint`, and `npm run build`.
Then visually compare downloaded PDF with the preview and print one page **at 100% / Actual size** with browser headers/footers disabled. Inspect baseline, dashed middle, tracing letter visibility, margins, descenders, size presets, and line counts, with and without distributed row spacing. Do not merge to main until QA passes.

## MVP limitations
- One letter-size page per worksheet; no automatic multipage export.
- Tracing glyphs are an original prototype, not a clinically standardized school handwriting font.
- Some symbols/diacritics not supported (shown as question marks in the trace, with a warning).
- PDF title uses built-in Helvetica and transliterates unsupported Unicode.
- Full-page text beyond available rows triggers an overflow warning; shorten input or reduce row height.
- No save/load or account backend (planned later).

## Workflow
Pure geometry and shared SVG/PDF trace layout. Keep QA on the feature branch; update this file at significant milestones.
