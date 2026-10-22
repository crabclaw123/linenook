# LineNook

**LineNook** is a React/TypeScript browser studio for printable handwriting and prewriting worksheets, designed for occupational therapists, teachers and families. No account or backend is required.

## Run locally

```bash
npm ci
npm run dev
```

## Make a worksheet

1. Edit the title and practice words in **Your Content**. Switch **Worksheet activity** to **Prewriting shapes and lines** for circle, square, triangle, zigzag, spiral, wave, horizontal-line and vertical-line vector exercises.
2. Under **Practice Support**, choose a global default: **Trace**, **Copy**, **Fade** or **Blank**. Select the number of blank independent-writing rows and adjust casing, letterforms or handedness if needed.
3. For **text worksheets**, select one or more words inside the practice-text box. Use **Customize selected text** to add yellow/mint/peach printable highlights, or override individual words with Trace/Copy/Fade/Blank. The native textbox remains plain text; the formatted worksheet is shown in the preview. Styled parts can be cleared separately.
4. Use **Activity Library** to find editable templates grouped into names/sentences, letter skills, themed writing and shapes.
5. Customize page size (US Letter/A4), line size, row spacing, character spacing, colors, Name/Date and margins. Preview remains visible while settings scroll on desktop.
6. Save a named setup locally under **My Saved Setups**. Use **Export current worksheet (.json)** or **Export** on a named setup to share a versioned JSON file. **Import shared worksheet (.json)** restores a shared configuration, including shapes and styled text.
7. Choose **Download PDF** or **Print worksheet**. Both use the same source millimeter geometry and original vector paths as the preview.

### Repetition and mixing behavior

- Short or multi-line phrases repeat as **complete practice blocks**. The number of reserved blank rows determines where tracing stops; an incomplete repetition is never started at the bottom.
- In worksheet-wide **Copy**, one solid complete model is shown followed by blank rows.
- For repeated sentences with some **solid Copy words** and others **dotted Trace words**, choose global **Trace**, then select and assign **Copy** to the relevant words. Global mode controls repetition; selected styles control the appearance of individual glyphs.
- **Fade** reduces the intensity of cues across repeated practice blocks. Selected words with explicit Fade support follow the same block progression.
- Word highlighting uses source text offsets, so it follows text through line wrapping, case conversion, and repeated blocks. When text is edited, annotations intersecting edited characters are removed to avoid styling the wrong word.

## Printing and limitations

- Print at **Actual Size / 100%** with the matching paper size. Printer margins and colors vary; conduct physical print QA before clinical deployment.
- Original glyphs/shapes are not certified or independently clinically validated.
- A worksheet exports as **one page**; automatic multipage worksheets are not available.
- Unsupported characters may display as question marks in vector tracing.
- Saved presets are stored in browser `localStorage`; exported JSON files are portable, but not hosted share links.
- Highlight colors may print differently on monochrome printers.

## Tests

```bash
npm run test:run
npm run lint
npm run build
```

See [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) and [ROADMAP.md](docs/ROADMAP.md) for development and QA status.
