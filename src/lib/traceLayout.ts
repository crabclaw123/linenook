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
  const repeating = !letterByLetter && items.length === 1;
  const copy = worksheet.practiceMode === "copy";
  const fade = worksheet.practiceMode === "fade";
  // A long phrase flows onto only a few rows: grade the cues across THOSE
  // rows rather than the entire page, while keeping every word readable.
  // Repeated short phrases still fade all the way to blank practice.
  const filledRowCount = Math.min(items.length, rows.length);
  function fadeOpacity(rowIndex: number): number {
    if (repeating) return rowOpacity(rowIndex, rows.length);
    return filledRowCount <= 1
      ? 1
      : 1 - 0.65 * rowIndex / (filledRowCount - 1);
  }

  const traceRows = rows.map((row, rowIndex): TraceRow => {
    const rowText = letterByLetter
      ? (items[rowIndex] ?? "")
      : (repeating ? items[0] : items[rowIndex]) ?? "";
    if (!rowText || (copy && !letterByLetter && repeating && rowIndex > 0)) {
      return { text: "", placements: [] };
    }
    if (fade && !letterByLetter && fadeOpacity(rowIndex) <= 0) {
      return { text: "", placements: [] };
    }

    // Repeat individual letters only while the complete sequence fits.
    // Account for the extra space characters between repeated letters as well
    // as the user-selected character spacing, preventing right-edge clipping.
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
    const opacity = fade && !letterByLetter
      ? fadeOpacity(rowIndex)
      : 1;

    const placements: TracePlacement[] = Array.from(drawn).map((character, index) => {
      const glyph = getHandwritingGlyph(character, worksheet.letterForm);
      const placement: TracePlacement = {
        glyph, x, y: row.top, scale,
        opacity: fade && letterByLetter ? rowOpacity(index, Array.from(drawn).length) : opacity,
        solid: copy,
      };
      x += (glyph.width + spacingUnits) * scale;
      return placement;
    }).filter((p) => p.opacity > 0);
    return { text: drawn, placements };
  });

  return {
    rows: traceRows,
    overflow: items.length > rows.length && !(repeating && !letterByLetter),
    unsupportedCharacters,
  };
}

/** Shared title sizing for on-screen, printed, and PDF worksheets. */
export function getWorksheetTitleSizeMm(worksheet: Worksheet): number {
  return Math.min(7.1, worksheet.area.width / Math.max(1, worksheet.title.length * 0.57));
}
