# LineNook — Project Status

LineNook is a browser-based tool for making customizable, printable handwriting worksheets for occupational therapists, teachers, and families.

## Stack
React + TypeScript + Vite, Vitest, ESLint, SVG live preview. No backend for v1. Material UI and PDF export are potential later additions, not installed.

## Branch
`feature/worksheet-studio` (merge to `main` after QA).

## Completed
- Page dimensions and usable-page-area calculations in millimeters.
- Row counting, row positions, top/middle/baseline guideline geometry.
- Input validation and unit/integration tests for the worksheet engine.
- `WorksheetConfig`, default settings, and `buildWorksheet()` orchestration.
- Step 20: Responsive worksheet studio UI with live US Letter SVG preview, editable worksheet title and practice phrase, controls for writing height, row height, margins, baseline highlighting, and reset.

## Current behavior and limitations
- SVG uses engine-calculated millimeter coordinates and visually scales to the screen.
- Practice phrase is drawn in light gray as a **sample**, not a tracing/dotted handwriting font. Multiple lines of input are flattened to one sample phrase.
- Worksheet is a live on-screen preview only; no printable PDF generation or save/load yet.
- Only US Letter paper is supported, and title-height reservation is fixed at 20 mm.

## Next
1. QA the preview on desktop and mobile; verify row count and controls react as expected.
2. Design correct handwriting/tracing lettering and its placement.
3. Add print/PDF output with accurate paper dimensions.
4. Add presets for common handwriting interventions and optional expanded paper sizes.

## Workflow
Keep geometry pure and UI independent; work on a feature branch, run `npm run test:run`, `npm run lint`, and `npm run build` locally before merging.
