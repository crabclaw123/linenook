import type { Worksheet } from "./buildWorksheet";
import {
  LETTER_SPACING,
  getHandwritingGlyph,
  isHandwritingCharacterSupported,
  type HandwritingGlyph,
} from "./handwritingGlyphs";

export type TracePlacement = {
  glyph: HandwritingGlyph;
  x: number;
  y: number;
  scale: number;
};
export type TraceRow = { text: string; placements: TracePlacement[] };
export type WorksheetTraceLayout = {
  rows: TraceRow[];
  overflow: boolean;
  unsupportedCharacters: string[];
};

export function measureTraceText(text: string): number {
  const characters = Array.from(text);
  return characters.reduce(
    (total, character, index) =>
      total + getHandwritingGlyph(character).width + (index ? LETTER_SPACING : 0),
    0
  );
}

/** Wraps at words where possible, splitting long words at character boundaries. */
export function wrapTraceText(text: string, maxUnits: number): string[] {
  if (!Number.isFinite(maxUnits) || maxUnits <= 0) {
    throw new Error("Available tracing width must be positive and finite.");
  }
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    let current = "";
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const candidate = current ? current + " " + word : word;
      if (measureTraceText(candidate) <= maxUnits) {
        current = candidate;
        continue;
      }
      if (current) {
        lines.push(current);
        current = "";
      }
      // A word wider than the page still needs to fit without clipping.
      for (const character of word) {
        if (current && measureTraceText(current + character) > maxUnits) {
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

export function getWorksheetTraceLayout(worksheet: Worksheet): WorksheetTraceLayout {
  const unsupportedCharacters = Array.from(
    new Set(
      Array.from(worksheet.practiceText)
        .filter((char) => !/\s/.test(char) && !isHandwritingCharacterSupported(char))
    )
  );

  const rows = worksheet.layout.rows;
  if (!worksheet.showTrace || rows.length === 0) {
    return { rows: rows.map(() => ({ text: "", placements: [] })), overflow: false, unsupportedCharacters };
  }

  const writingHeight = rows[0].baseline - rows[0].top;
  const scale = writingHeight / 10;
  const startX = worksheet.area.startX + 2;
  const maxUnits = (worksheet.area.width - 4) / scale;
  const lines = wrapTraceText(worksheet.practiceText, maxUnits);

  // One short word/phrase repeats on every row. Longer content flows down the page.
  const repeat = lines.length === 1;
  const traceRows = rows.map((row, rowIndex) => {
    const text = (repeat ? lines[0] : lines[rowIndex]) ?? "";
    let x = startX;
    const placements = Array.from(text).map((character) => {
      const glyph = getHandwritingGlyph(character);
      const placement: TracePlacement = { glyph, x, y: row.top, scale };
      x += (glyph.width + LETTER_SPACING) * scale;
      return placement;
    });
    return { text, placements };
  });

  return {
    rows: traceRows,
    overflow: lines.length > rows.length,
    unsupportedCharacters,
  };
}

/** Shared title sizing for on-screen, printed, and PDF worksheets. */
export function getWorksheetTitleSizeMm(worksheet: Worksheet): number {
  return Math.min(7.1, worksheet.area.width / Math.max(1, worksheet.title.length * 0.57));
}
