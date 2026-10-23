import type { Worksheet } from "./buildWorksheet";
import {
  LETTER_SPACING, getHandwritingGlyph, isHandwritingCharacterSupported,
  type HandwritingGlyph,
} from "./handwritingGlyphs";
import { PREWRITING_SHAPES } from "./prewritingShapes";
import { textStyleAt } from "./textMarks";
import {
  getRowWordSpacingCues,
  type SpacingCharacter,
  type WordSpacingPrimitive,
} from "./wordSpacing";
import type { LetterCase, LetterForm, PracticeMode, HighlightTone } from "../types/worksheet";

export type TracePlacement = {
  glyph: HandwritingGlyph;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  solid: boolean;
  highlight?: HighlightTone;
  /** Offset into the source textarea text; repeats use the original offset. */
  sourceIndex?: number;
};

export type TraceRow = {
  text: string;
  placements: TracePlacement[];
  /** All word-space cue paths, including reminders on independent blank rows. */
  spacingCues?: WordSpacingPrimitive[];
};
export type WorksheetTraceLayout = {
  rows: TraceRow[];
  overflow: boolean;
  unsupportedCharacters: string[];
};

export function transformPracticeText(text: string, letterCase: LetterCase): string {
  if (letterCase === "uppercase") return text.toUpperCase();
  if (letterCase === "lowercase") return text.toLowerCase();
  return text;
}

export function measureTraceText(
  text: string, letterForm: LetterForm = "simple", spacingUnits = LETTER_SPACING
): number {
  return Array.from(text).reduce(
    (total, character, index) =>
      total + getHandwritingGlyph(character, letterForm).width +
      (index ? spacingUnits : 0), 0
  );
}

/** Legacy public helper retained for templates/tests and general wrapping. */
export function wrapTraceText(
  text: string, maxUnits: number, letterForm: LetterForm = "simple",
  spacingUnits = LETTER_SPACING
): string[] {
  return wrapIndexedTraceText(text, "as-typed", maxUnits, letterForm, spacingUnits)
    .map((line) => line.text);
}

type IndexedChar = { char: string; sourceIndex: number };
export type IndexedLine = { text: string; chars: IndexedChar[] };

function convertedChar(char: string, letterCase: LetterCase): string {
  const result = transformPracticeText(char, letterCase);
  // A case change that expands into multiple glyphs cannot safely inherit a
  // single source selection offset: retain the original and warn.
  return result.length === char.length ? result : char;
}

/** Wrap without losing original selection offsets through line breaks or repeats. */
export function wrapIndexedTraceText(
  source: string, letterCase: LetterCase, maxUnits: number,
  letterForm: LetterForm = "simple", spacingUnits = LETTER_SPACING
): IndexedLine[] {
  if (!Number.isFinite(maxUnits) || maxUnits <= 0) {
    throw new Error("Available tracing width must be positive and finite.");
  }
  const result: IndexedLine[] = [];
  let current: IndexedChar[] = [];
  let lastWordEnd = 0;
  const emit = () => {
    if (current.length) {
      result.push({ text: current.map((item) => item.char).join(""), chars: current });
      current = [];
    }
  };
  for (const match of source.matchAll(/\S+/g)) {
    const sourceStart = match.index ?? 0;
    const gap = source.slice(lastWordEnd, sourceStart);
    if (gap.includes("\n") || gap.includes("\r")) emit();
    const word: IndexedChar[] = [];
    let offset = sourceStart;
    for (const character of Array.from(match[0])) {
      word.push({ char: convertedChar(character, letterCase), sourceIndex: offset });
      offset += character.length;
    }
    const space: IndexedChar[] = current.length
      ? [{ char: " ", sourceIndex: lastWordEnd }] : [];
    const candidate = [...current, ...space, ...word];
    if (measureTraceText(
      candidate.map((item) => item.char).join(""), letterForm, spacingUnits
    ) <= maxUnits) {
      current = candidate;
    } else {
      emit();
      for (const character of word) {
        const next = [...current, character];
        if (current.length && measureTraceText(
          next.map((item) => item.char).join(""), letterForm, spacingUnits
        ) > maxUnits) emit();
        current.push(character);
      }
    }
    lastWordEnd = sourceStart + match[0].length;
  }
  emit();
  return result;
}

function fadedLevel(position: number, count: number): number {
  return count <= 1 ? 1 : 1 - 0.75 * position / (count - 1);
}

function getShapeRows(worksheet: Worksheet, scale: number, maxUnits: number):
  WorksheetTraceLayout {
  const rows = worksheet.layout.rows;
  const blank = Math.min(
    Math.max(0, Math.floor(worksheet.blankPracticeRows)),
    Math.max(0, rows.length - 1)
  );
  const available = rows.length - blank;
  const shape = PREWRITING_SHAPES[worksheet.shapeId];
  const spacingUnits = LETTER_SPACING + worksheet.characterSpacing / scale + 2;
  const copies = Math.max(1, Math.min(8, Math.floor(
    (maxUnits + spacingUnits) / (shape.glyph.width + spacingUnits)
  )));
  const drawnWidth = (copies * shape.glyph.width +
    Math.max(0, copies - 1) * spacingUnits) * scale;

  const shapeRows = rows.map((row, rowIndex): TraceRow => {
    if (!worksheet.showTrace || worksheet.practiceMode === "blank" ||
        rowIndex >= available ||
        (worksheet.practiceMode === "copy" && rowIndex > 0)) {
      return { text: "", placements: [] };
    }
    const solid = worksheet.practiceMode === "copy";
    const opacity = worksheet.practiceMode === "fade"
      ? fadedLevel(rowIndex, available) : 1;
    const left = worksheet.area.startX + (worksheet.area.width - drawnWidth) / 2;
    return {
      text: shape.label,
      placements: Array.from({ length: copies }, (_, index) => ({
        glyph: shape.glyph,
        x: left + index * (shape.glyph.width + spacingUnits) * scale,
        y: row.top, scale, opacity, solid,
      })),
    };
  });
  return { rows: shapeRows, overflow: false, unsupportedCharacters: [] };
}

export function getWorksheetTraceLayout(worksheet: Worksheet): WorksheetTraceLayout {
  const rows = worksheet.layout.rows;
  const emptyRows = rows.map((): TraceRow => ({ text: "", placements: [] }));
  if (!rows.length) {
    return { rows: emptyRows, overflow: false, unsupportedCharacters: [] };
  }

  const writingHeight = rows[0].baseline - rows[0].top;
  const scale = writingHeight / 10;
  const maxUnits = (worksheet.area.width - 4) / scale;
  if (worksheet.activityType === "shapes") {
    return getShapeRows(worksheet, scale, maxUnits);
  }

  const source = worksheet.practiceText;
  const display = Array.from(source).map((char) =>
    convertedChar(char, worksheet.letterCase)).join("");
  const unsupportedCharacters = Array.from(new Set(
    Array.from(display).filter((char) =>
      !/\s/.test(char) && !isHandwritingCharacterSupported(char)
    )
  ));
  if (worksheet.wordSpacingCue === "none" && (
      !worksheet.showTrace ||
      (worksheet.practiceMode === "blank" &&
        !worksheet.textMarks.some((mark) => mark.mode !== undefined))
  )) {
    return { rows: emptyRows, overflow: false, unsupportedCharacters };
  }

  const spacingUnits = LETTER_SPACING + worksheet.characterSpacing / scale;
  const left = worksheet.area.startX + 2;
  const right = worksheet.area.startX + worksheet.area.width - 2;
  const letterByLetter = worksheet.promptStyle === "letter-by-letter";
  const items: IndexedLine[] = letterByLetter
    ? Array.from(source.matchAll(/\S/g)).map((match) => ({
        text: convertedChar(match[0], worksheet.letterCase),
        chars: [{
          char: convertedChar(match[0], worksheet.letterCase),
          sourceIndex: match.index ?? 0,
        }],
      }))
    : wrapIndexedTraceText(
        source, worksheet.letterCase, maxUnits, worksheet.letterForm, spacingUnits
      );

  const copy = worksheet.practiceMode === "copy";
  const reservedBlankRows = Math.min(
    Math.max(0, Math.floor(worksheet.blankPracticeRows)),
    Math.max(0, rows.length - 1)
  );
  const availableRowCount = rows.length - reservedBlankRows;
  const blockLength = items.length;
  const completeBlockFits = blockLength > 0 && blockLength <= availableRowCount;
  const blockCopies = !letterByLetter && !copy && completeBlockFits
    ? Math.floor(availableRowCount / blockLength) : 1;
  const promptedRows = !letterByLetter && !copy && completeBlockFits
    ? blockCopies * blockLength : Math.min(blockLength, availableRowCount);

  function fadeOpacity(rowIndex: number): number {
    if (letterByLetter) return 1;
    if (completeBlockFits && blockCopies > 1) {
      return fadedLevel(Math.floor(rowIndex / blockLength), blockCopies);
    }
    const visible = Math.min(blockLength, availableRowCount);
    return visible <= 1 ? 1 : 1 - 0.65 * rowIndex / (visible - 1);
  }

  // Support fades between complete phrase repetitions, not between the
  // separate writing lines of one wrapped sentence.
  const totalCueGroups = letterByLetter
    ? rows.length
    : copy
      ? 1 + Math.max(0, rows.length - Math.min(blockLength, rows.length))
      : blockCopies + Math.max(0, rows.length - promptedRows);

  function cueGroupIndex(rowIndex: number): number {
    if (letterByLetter) return rowIndex;
    if (copy) return rowIndex < blockLength ? 0 : 1 + rowIndex - blockLength;
    return rowIndex < promptedRows
      ? Math.floor(rowIndex / Math.max(1, blockLength))
      : blockCopies + rowIndex - promptedRows;
  }

  const traceRows = rows.map((row, rowIndex): TraceRow => {
    if (rowIndex >= promptedRows || blockLength === 0) {
      // Minimal reminders can continue onto independent writing rows.
      return {
        text: "",
        placements: [],
        spacingCues: blockLength === 0 ? [] : getRowWordSpacingCues(
          worksheet, [], row, cueGroupIndex(rowIndex), totalCueGroups
        ),
      };
    }
    const item = items[letterByLetter || copy ? rowIndex : rowIndex % blockLength];
    if (!item) return { text: "", placements: [] };

    let chars = item.chars;
    let drawn = item.text;
    // Repeat single-letter targets across their own row without clipping.
    if (letterByLetter && !copy) {
      const original = item.chars[0];
      let count = 5;
      const candidates = (n: number): IndexedChar[] =>
        Array.from({ length: n }, () => [{ ...original }]).flatMap(
          (part, index) => index ? [{ char: " ", sourceIndex: -1 }, ...part] : part
        );
      chars = candidates(count);
      while (count > 1 && measureTraceText(
        chars.map((ch) => ch.char).join(""), worksheet.letterForm, spacingUnits
      ) > maxUnits) {
        count--;
        chars = candidates(count);
      }
      drawn = chars.map((ch) => ch.char).join("");
    }

    const width = measureTraceText(drawn, worksheet.letterForm, spacingUnits) * scale;
    const referenceRight = copy && worksheet.writingHand === "left";
    let x = referenceRight ? right - width : left;
    const fadeAtRow = fadeOpacity(rowIndex);
    const spacingCharacters: SpacingCharacter[] = [];
    const placements: TracePlacement[] = chars.map(({ char, sourceIndex }, index) => {
      const mark = sourceIndex >= 0 ? textStyleAt(worksheet.textMarks, sourceIndex) : {};
      const mode: PracticeMode = mark.mode ?? worksheet.practiceMode;
      const opacity = mode === "blank" ? 0 : mode === "fade"
        ? (letterByLetter ? fadedLevel(index, chars.length) : fadeAtRow) : 1;
      const glyph = getHandwritingGlyph(char, worksheet.letterForm);
      const width = glyph.width * scale;
      const advance = (glyph.width + spacingUnits) * scale;
      spacingCharacters.push({ char, x, width, advance });
      const placement: TracePlacement = {
        glyph,
        x, y: row.top, scale, opacity,
        solid: mode === "copy",
        highlight: mark.highlight,
        sourceIndex,
      };
      x += advance;
      return placement;
    }).filter((item) => worksheet.showTrace && item.opacity > 0);
    return {
      text: drawn,
      placements,
      spacingCues: getRowWordSpacingCues(
        worksheet, spacingCharacters, row, cueGroupIndex(rowIndex), totalCueGroups
      ),
    };
  });

  return {
    rows: traceRows,
    overflow: blockLength > availableRowCount,
    unsupportedCharacters,
  };
}

/** Shared title sizing for on-screen, printed, and PDF worksheets. */
export function getWorksheetTitleSizeMm(worksheet: Worksheet): number {
  return Math.min(7.1, worksheet.area.width / Math.max(1, worksheet.title.length * 0.57));
}
