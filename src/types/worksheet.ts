export type PaperSize = "letter" | "a4";
export type LineStyle = "classic" | "color-cues" | "double" | "baseline";
export type LetterCase = "as-typed" | "uppercase" | "lowercase";
export type LetterForm = "simple" | "rounded";
export type PromptStyle = "whole" | "letter-by-letter";
export type PracticeMode = "trace" | "copy" | "fade" | "blank";
export type WritingHand = "right" | "left";

export type WorksheetConfig = {
  title: string;
  practiceText: string;
  paperSize: PaperSize;
  margin: number;
  titleHeight: number;
  /** Total row pitch: writing height plus space for descenders. */
  rowHeight: number;
  /** Distance from top guideline to baseline, in millimeters. */
  writingHeight: number;
  fillPage: boolean;
  highlightBaseline: boolean;
  /** Maintained for backward compatibility with Phase 1 configurations. */
  showTrace: boolean;
  lineStyle: LineStyle;
  letterCase: LetterCase;
  letterForm: LetterForm;
  promptStyle: PromptStyle;
  practiceMode: PracticeMode;
  writingHand: WritingHand;
  /** Extra space between adjacent characters, in physical millimeters. */
  characterSpacing: number;
  /** Number of writing rows reserved at the bottom for independent practice. */
  blankPracticeRows: number;
  showName: boolean;
  showDate: boolean;
};
