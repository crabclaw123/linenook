# LineNook

**LineNook** is a browser-based printable handwriting worksheet studio for occupational therapists, teachers, and families. Customize handwriting guidelines and graded practice prompts without creating an account.

## Run locally

```bash
npm ci
npm run dev
```

Open the local Vite URL shown in your terminal.

## Make a worksheet

1. Choose a starter content template or enter your own **title** and practice phrase.
2. Under **Practice support**, select:
   - **Trace:** dotted letters on writing rows.
   - **Copy:** solid model on the first row and blank rows underneath (or one model per letter row).
   - **Fade:** repeated dotted prompts gradually lighten to blank for independent writing. For longer nonrepeating text, cues progressively lighten across the rows that contain text.
   - **Blank:** empty guidelines.
3. Switch **Whole word or phrase** to **One letter per row** for individual letters, and optionally choose uppercase, lowercase, alternative rounded letterforms, or left-handed Copy reference positioning.
4. Under **Writing lines**, choose Compact, Everyday or Extra room. Adjust line height, row gap, and **extra space between characters (0–8 mm)**; the latter adds a fixed physical amount of space without stretching letters, and text wraps automatically. Choose Classic / Color cues / Double / Baseline only guidelines, and select **US Letter** or **A4**.
5. Optionally check **Name** and **Date** under Page Header. LineNook reserves space for those fields without overlapping the practice rows.
6. Under **My saved setups**, save a named configuration and reload it later. Current settings also restore automatically in the same browser. The 20 most recently saved setups are stored locally; these do **not** sync across devices.
7. Export **Download PDF** (vector) or **Print worksheet** (browser printing). All changes update the preview live.

Short phrases repeat, except in Copy mode (where later rows are blank). Longer text wraps. Letter-by-letter prompts use one row per character. Text that exceeds the page's capacity gets an on-screen warning.

## Printing

Choose the corresponding physical paper size, **Actual size / 100%**, and disable browser headers/footers. Letter PDF is **612 × 792 pt**; A4 PDF is **595.276 × 841.89 pt**. Printer nonprintable margins vary; inspect on paper before classroom/clinical distribution.

## Technical design

- React + SVG for responsive interactive preview.
- Pure TypeScript millimeter-based layout and line-gap calculations.
- Shared geometry for guideline styles, optional header labels, tracing glyph placement and coloring in SVG and PDF.
- Dependency-free one-page vector PDF writer (no raster screenshot export).
- Browser `localStorage` for current settings and named presets (no backend).
- Unit tests for modes, line spacing, headers, wrapping, saved state, A4 PDF dimensions and export content.

## Important limitations

- **Original, unvalidated teaching glyphs:** This is a prototype handwriting alphabet, not a clinician-validated or licensed handwriting curriculum. Clinicians should review each letterform and formation sequence before use.
- Uppercase/lowercase English letters, digits, and common punctuation are supported. Unsupported characters become a '?' and are flagged.
- One-page export only; automatic multipage, shareable presets, and activity library remain future work.
- Named presets are local to the browser. Clearing site storage can erase them.
- Your physical printer and browser may need manual paper/scaling adjustment.

## Development

```bash
npm run test:run
npm run lint
npm run build
```

Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md). Project status: [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
