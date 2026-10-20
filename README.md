# LineNook

**LineNook** is a browser-based handwriting worksheet studio for occupational therapists, teachers, and families. Customize US Letter writing paper and print tracing or blank-line practice sheets — without creating an account.

## Run locally

```bash
npm ci
npm run dev
```

Open the local Vite URL displayed in your terminal.

## Make a worksheet

1. Choose a starter preset (name, letters, numbers, sentence, or greeting), or write your own title and practice phrase.
2. Adjust writing height, row height, margins, and baseline highlighting.
3. Leave **Dotted tracing letters** on for traceable single-stroke letters, or turn it off for empty lines.
4. Preview updates immediately. Short text repeats on each row; long sentences wrap down the page. If it exceeds the one-page space, a warning appears.
5. Click **Download PDF** for a one-page, vector US Letter file, or **Print worksheet** for browser printing.

For physical printing choose **US Letter**, **Actual size / 100%**, and turn off browser headers/footers. PDF dimensions are exactly **612 × 792 points (8.5 × 11 in)**. The printer itself may impose non-printable margins.

## Technical design

- React and SVG for the editor and responsive preview.
- Pure TypeScript layout calculations use millimeters.
- The same original vector monoline character paths power both SVG dotted tracing and PDF export.
- Lightweight dependency-free PDF writer for a single page (no browser screenshot/rasterization).
- Unit tests for layout, character support, wrapping, and PDF structure.

## Known limitations

- **Prototype handwriting style:** Letterforms are designed for tracing practice, not certified against any specific handwriting curriculum. Review them for your students before clinical/educational use.
- Uppercase/lowercase English letters, digits, and common punctuation supported. Unsupported characters become `?` in tracing, with an on-screen warning. PDF titles transliterate to basic Latin where possible.
- One page only; no automatic multipage support.
- Save/load and more specialized clinical templates are planned later.

## Development

```bash
npm run test:run
npm run lint
npm run build
```

Project direction: [docs/ROADMAP.md](docs/ROADMAP.md). Current progress: [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
