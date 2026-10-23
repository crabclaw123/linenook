import type { Worksheet } from "./buildWorksheet";
import type { WordSpacingCueStyle, WordSpacingSupportLevel } from "../types/worksheet";

/**
 * Word-spacing cues are independent of handwriting stroke style.
 * Positions use the same physical millimeters as the SVG and PDF renderers.
 */
export type SpacingCharacter = {
  char: string;
  x: number;
  width: number;
  advance: number;
};

export type WordSpacingPrimitive =
  | { kind: "band"; x: number; y: number; width: number; height: number; color: string }
  | { kind: "dot"; x: number; y: number; radius: number; color: string }
  | { kind: "box"; x: number; y: number; width: number; height: number; color: string; strokeWidth: number }
  | { kind: "reminder"; x: number; y: number; fontSize: number; color: string; text: string };

export const WORD_SPACING_STYLE_LABELS: Readonly<Record<WordSpacingCueStyle, string>> = {
  none: "None",
  dots: "Colored dots",
  highlight: "Highlighted spaces",
  boxes: "Word boxes",
  finger: "Finger-spacing reminder",
};

export const WORD_SPACING_LEVEL_LABELS: Record<WordSpacingSupportLevel, string> = {
  1: "Maximum — strong visual spacing cues",
  2: "Moderate — smaller colored dots",
  3: "Minimal — finger-space reminder",
  4: "Independent — no spacing cues",
};

/**
 * Progression is grouped by whole practice blocks. For example, the 2nd
 * line of a 2-line sentence always has the same spacing level as its 1st.
 */
export function getWordSpacingLevel(
  startingLevel: WordSpacingSupportLevel,
  gradual: boolean,
  blockIndex: number,
  totalBlocks: number
): WordSpacingSupportLevel {
  if (!gradual || totalBlocks <= 1) return startingLevel;
  const index = Math.max(0, Math.min(totalBlocks - 1, Math.floor(blockIndex)));
  return Math.min(4, startingLevel + Math.floor(
    (4 - startingLevel) * index / (totalBlocks - 1)
  )) as WordSpacingSupportLevel;
}

function reminder(
  areaX: number, y: number, level: WordSpacingSupportLevel, style: WordSpacingCueStyle
): WordSpacingPrimitive {
  const size = style === "finger"
    ? (level === 1 ? 3.5 : level === 2 ? 3 : 2.5)
    : 2.5;
  return {
    kind: "reminder",
    x: areaX + 1.5,
    y: y - 1.4,
    fontSize: size,
    color: level === 1 ? "#2f735d" : "#66907c",
    text: "FINGER SPACE",
  };
}

/** Draw only between actual words; never at a line wrap or after punctuation. */
export function getRowWordSpacingCues(
  worksheet: Worksheet,
  characters: readonly SpacingCharacter[],
  row: Worksheet["layout"]["rows"][number],
  blockIndex: number,
  totalBlocks: number
): WordSpacingPrimitive[] {
  if (worksheet.activityType !== "text" || worksheet.promptStyle !== "whole" ||
      worksheet.wordSpacingCue === "none") return [];

  const style = worksheet.wordSpacingCue;
  const level = getWordSpacingLevel(
    worksheet.wordSpacingLevel,
    worksheet.wordSpacingProgression,
    blockIndex,
    totalBlocks
  );
  if (level === 4) return [];
  if (level === 3 || style === "finger") {
    return [reminder(worksheet.area.startX, row.top, level, style)];
  }

  const writingHeight = row.baseline - row.top;
  const spaces = characters.filter((c, i) =>
    c.char === " " && i > 0 && i < characters.length - 1 &&
    !/\s/.test(characters[i - 1].char) &&
    !/\s/.test(characters[i + 1].char)
  );
  if (level === 2 || style === "dots") {
    const radius = level === 1 ? 1.55 : 0.95;
    return spaces.map((space) => ({
      kind: "dot",
      x: space.x + space.advance / 2,
      y: row.top + writingHeight * 0.78,
      radius,
      color: level === 1 ? "#e3a343" : "#cf874a",
    }));
  }

  if (style === "highlight") {
    return spaces.map((space) => ({
      kind: "band",
      x: space.x - 0.2,
      y: row.top + writingHeight * 0.1,
      width: space.advance + 0.4,
      height: writingHeight * 0.89,
      color: "#ffe79f",
    }));
  }

  if (style === "boxes") {
    const words: SpacingCharacter[][] = [];
    let current: SpacingCharacter[] = [];
    for (const char of characters) {
      if (/\s/.test(char.char)) {
        if (current.length) words.push(current);
        current = [];
      } else {
        current.push(char);
      }
    }
    if (current.length) words.push(current);
    return words.map((word) => {
      const left = word[0].x - 0.65;
      const right = word.at(-1)!.x + word.at(-1)!.width + 0.65;
      return {
        kind: "box",
        x: left, y: row.top - 0.65,
        width: Math.max(0, right - left),
        height: writingHeight + 1.3,
        color: "#438c70",
        strokeWidth: 0.4,
      };
    });
  }
  return [];
}
