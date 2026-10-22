import type { Worksheet } from "./buildWorksheet";
import {
  LETTER_SPACING,
  getHandwritingGlyph,
  isHandwritingCharacterSupported,
  type HandwritingGlyph,
} from "./handwritingGlyphs";
import type { LetterForm } from "../types/worksheet";

export type TracePlacement = {
  glyph: HandwritingGlyph;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  solid: boolean;
};

export type TraceRow = { text: string; placements: TracePlacement[] };
export type WorksheetTraceLayout = {
  rows: TraceRow[];
  overflow: boolean;
  unsupportedCharacters: string[];
};

export function transformPracticeText(text: string, letterCase: Worksheet["letterCase"]): string {
  if (letterCase === "uppercase") return text.toUpperCase();
  if (letterCase === "lowercase") return text.toLowerCase();
  return text;
}

export function measureTraceText(
  text: string,
  letterForm: LetterForm = "simple",
  spacingUnits = LETTER_SPACING
): number {
  return Array.from(text).reduce(
    (total, character, index) => total +
      getHandwritingGlyph(character, letterForm).width + (index ? spacingUnits : 0),
    0
  );
}

/** Wrap at words where possible; very long words break at individual glyphs. */
export function wrapTraceText(
  text: string,
  maxUnits: number,
  letterForm: LetterForm = "simple",
  spacingUnits = LETTER_SPACING
): string[] {
  if (!Number.isFinite(maxUnits) || maxUnits <= 0) {
    throw new Error("Available tracing width must be positive and finite.");
  }
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    let current = "";
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const candidate = current ? current + " " + word : word;
      if (measureTraceText(candidate, letterForm, spacingUnits) <= maxUnits) {
        current = candidate;
        continue;
      }
      if (current) {
        lines.push(current);
        current = "";
      }
      for (const character of word) {
        if (current && measureTraceText(current + character, letterForm, spacingUnits) > maxUnits) {
          lines.push(current);
          current = "";
        }
        current += character;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function rowOpacity(index: number, rowCount: number): number {
  return rowCount <= 1 ? 1 : 1 - index / (rowCount - 1);
}

export function getWorksheetTraceLayout(worksheet: Worksheet): WorksheetTraceLayout {
  const text = transformPracticeText(worksheet.practiceText, worksheet.letterCase);
  const unsupportedCharacters = Array.from(new Set(
    Array.from(text).filter((char) =>
      !/\s/.test(char) && !isHandwritingCharacterSupported(char)
    )
  ));

  const rows = worksheet.layout.rows;
  const emptyRows = rows.map((): TraceRow => ({ text: "", placements: [] }));
  if (!worksheet.showTrace || worksheet.practiceMode === "blank" || rows.length === 0) {
    return { rows: emptyRows, overflow: false, unsupportedCharacters };
  }

  const writingHeight = rows[0].baseline - rows[0].top;
  const scale = writingHeight / 10;
  // Spacing is entered in millimeters, then converted into glyph units.
  // Every SVG/PDF placement and line-wrap calculation uses this same value.
  const spacingUnits = LETTER_SPACING + worksheet.characterSpacing / scale;
  const left = worksheet.area.startX + 2;
  const right = worksheet.area.startX + worksheet.area.width - 2;
  const maxUnits = (worksheet.area.width - 4) / scale;
  const letterByLetter = worksheet.promptStyle === "letter-by-letter";
  const items = letterByLetter
    ? Array.from(text).filter((character) => !/\s/.test(character))
    : wrapTraceText(text, maxUnits, worksheet.letterForm, spacingUnits);
  const copy = worksheet.practiceMode === "copy";
  const fade = worksheet.practiceMode === "fade";
  const reservedBlankRows = Math.min(
    Math.max(0, Math.floor(worksheet.blankPracticeRows)),
    Math.max(0, rows.length - 1)
  );
  const availableRowCount = rows.length - reservedBlankRows;
  const blockLength = items.length;
  const completeBlockFits = blockLength > 0 && blockLength <= availableRowCount;

  // A phrase that wraps to two or more rows is one reusable practice block.
  // Repeat ONLY complete blocks; never leave half a sentence at the page bottom.
  // Copy mode deliberately shows one model block followed by independent rows.
  // One-letter-per-row preserves its existing targeted, one-pass progression.
  const blockCopies = !letterByLetter && !copy && completeBlockFits
    ? Math.floor(availableRowCount / blockLength)
    : 1;
  const promptedRows = !letterByLetter && !copy && completeBlockFits
    ? blockCopies * blockLength
    : Math.min(blockLength, availableRowCount);

  function fadeOpacity(rowIndex: number): number {
    if (!fade) return 1;
    if (letterByLetter) return 1;
    if (completeBlockFits && blockCopies > 1) {
      // Each complete repetition has an equally legible internal letter model.
      // The next repetition fades, progressing toward independent practice.
      const repetition = Math.floor(rowIndex / blockLength);
      return 1 - 0.75 * repetition / (blockCopies - 1);
    }
    // A single block (or an oversized phrase) grades across its visible rows.
    const visibleInBlock = Math.min(blockLength, availableRowCount);
    return visibleInBlock <= 1 ? 1 : 1 - 0.65 * rowIndex / (visibleInBlock - 1);
  }

  const traceRows = rows.map((row, rowIndex): TraceRow => {
    if (rowIndex >= promptedRows || blockLength === 0) {
      return { text: "", placements: [] };
    }

    const rowText = items[
      letterByLetter || copy ? rowIndex : rowIndex % blockLength
    ] ?? "";
    if (!rowText) return { text: "", placements: [] };

    // Repeat individual letters only while the complete sequence fits.
    // Account for extra space characters and custom letter spacing.
    let copies = letterByLetter && !copy ? 5 : 1;
    let drawn = Array(copies).fill(rowText).join(letterByLetter ? " " : "");
    while (copies > 1 &&
      measureTraceText(drawn, worksheet.letterForm, spacingUnits) > maxUnits) {
      copies--;
      drawn = Array(copies).fill(rowText).join(letterByLetter ? " " : "");
    }
    const width = measureTraceText(drawn, worksheet.letterForm, spacingUnits) * scale;
    const referenceRight = copy && worksheet.writingHand === "left";
    let x = referenceRight ? right - width : left;
    const opacity = fadeOpacity(rowIndex);
    const characters = Array.from(drawn);

    const placements: TracePlacement[] = characters.map((character, index) => {
      const glyph = getHandwritingGlyph(character, worksheet.letterForm);
      const placement: TracePlacement = {
        glyph, x, y: row.top, scale,
        opacity: fade && letterByLetter
          ? rowOpacity(index, characters.length)
          : opacity,
        solid: copy,
      };
      x += (glyph.width + spacingUnits) * scale;
      return placement;
    }).filter((p) => p.opacity > 0);
    return { text: drawn, placements };
  });

  return {
    rows: traceRows,
    // The full phrase must fit at least once within the usable writing rows.
    // An incomplete repeated block at the end is intentional blank practice,
    // not lost content or an overflow.
    overflow: blockLength > availableRowCount,
    unsupportedCharacters,
  };
}

/** Shared title sizing for on-screen, printed, and PDF worksheets. */
export function getWorksheetTitleSizeMm(worksheet: Worksheet): number {
  return Math.min(7.1, worksheet.area.width / Math.max(1, worksheet.title.length * 0.57));
}
