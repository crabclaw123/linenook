# LineNook — Project Status

LineNook makes customizable, printable handwriting worksheets for OTs, teachers, and families.

## Stack
React, TypeScript, Vite, Vitest, ESLint, SVG. No backend and no new PDF dependencies.

## Branch strategy
- `main`: merged Phase 1 baseline; leave unchanged until review and pull request.
- `feature/phase-2-worksheet-enhancements`: Phase 2 implementation and hands-on QA.

## Phase 2 — Feature implementation, pending physical and clinical QA
- Four guideline styles: classic top/dashed mid/baseline, color-cued three lines, double line and baseline only.
- Options for trace, solid exemplar followed by copying lines, fading trace, and blank guidelines.
- One letter per row for targeted practice, and uppercase/lowercase conversion.
- Simple and rounded prototype manuscript alternatives for a, g, t and I; cleaned up common baseline curves.
- Left-handed Copy reference placed on the right-hand side of the paper.
- Optional Name/Date blanks positioned below worksheet title; 13 mm reserved header space so no writing-row overlap.
- Both US Letter and A4 pages; SVG and PDF use shared physical millimeter measurements.
- Browser-local current-setting restoration and up to 20 reusable named presets.
- Refined stroke thickness/dot spacing in both printable PDF and live SVG preview.

## Testing
CI should run:
```bash
npm run test:run
npm run lint
npm run build
```

## Hands-on QA before marking Phase 2 production ready
1. Open presets and try Trace, Copy, Fade, and Blank for “Hello” and “happy puppy.”
2. Toggle **One letter per row**, switch uppercase/lowercase, and compare simple/rounded alternatives including **a g t I**.
3. In Copy mode compare left-handed vs standard. Verify the right-side model remains visible and leaves writing space.
4. Enable Name and Date together and individually; ensure title, header fields, and first writing row never overlap.
5. Test every guideline style and baseline color, sizes, and page-space distribution.
6. Download US Letter and A4 PDFs and compare their glyphs, lines, positions, headers, and colors to the browser preview.
7. Print both formats at **100% / Actual size**, disable headers and footers, select the corresponding physical paper size, inspect descenders **g j p q y**, check line gaps.
8. Test named preset save, load, overwrite, deletion, and reload, including in a browser where storage is disabled.
9. Clinically inspect stroke directions, manuscript conventions, alternative shapes, and any handwriting prompts. No clinician review has yet been recorded.

## Known limitations
- One page per worksheet; no automatic multipage export.
- Original prototype glyphs; **not clinically validated** or standardized handwriting-curriculum letterforms.
- Some symbols and diacritics are replaced with '?' in tracing and flagged with a warning.
- PDF title and Name/Date labels use PDF built-in Helvetica; titles transliterate unsupported Unicode.
- Browser-only saved settings and presets; browser storage may be cleared, and there is no cloud syncing.
- Letter-by-letter prompts take one row per character; excess characters trigger a warning.
- Printing depends on browser/printer settings, including correct physical paper size and 100% scaling.
