export type PaperSize = "letter" | "a4";
export type LineStyle = "classic" | "color-cues" | "double" | "baseline";
export type LetterCase = "as-typed" | "uppercase" | "lowercase";
export type LetterForm = "simple" | "rounded";
export type PromptStyle = "whole" | "letter-by-letter";
export type PracticeMode = "trace" | "copy" | "fade" | "blank";
export type WritingHand = "right" | "left";
export type ActivityType = "text" | "shapes";
export type ShapeId = "horizontal" | "vertical" | "wave" | "zigzag" | "circle" |
  "square" | "triangle" | "spiral";
export type HighlightTone = "yellow" | "mint" | "peach";
export type WordSpacingCueStyle = "none" | "dots" | "highlight" | "boxes" | "finger";
export type WordSpacingSupportLevel = 1 | 2 | 3 | 4;
/** Start and end are UTF-16 offsets into practiceText (as used by textarea.selectionStart). */
export type TextMark = {
  start: number;
  end: number;
  mode?: PracticeMode;
  highlight?: HighlightTone;
};

export type WorksheetConfig = {
  title: string;
  practiceText: string;
  /** Print either written text or vector prewriting shapes. */
  activityType: ActivityType;
  shapeId: ShapeId;
  /** Editable ranges which repeat with the source text across wrapped practice blocks. */
  textMarks: TextMark[];
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
  /** Independently rendered spacing cues, even for Blank/Fade writing activities. */
  wordSpacingCue: WordSpacingCueStyle;
  /** 1 = strongest supports; 4 = completely independent. */
  wordSpacingLevel: WordSpacingSupportLevel;
  /** Reduce supports between complete repeated phrase blocks, never mid-phrase. */
  wordSpacingProgression: boolean;
  showName: boolean;
  showDate: boolean;
};
