export type WorksheetConfig = {
  title: string;
  practiceText: string;
  paperSize: "letter";
  margin: number;
  titleHeight: number;
  /** Total row pitch; in the studio this is writingHeight + reserved gap. */
  rowHeight: number;
  /** Distance from top guideline to baseline. */
  writingHeight: number;
  /** Distribute the remaining page height into the spaces between rows. */
  fillPage: boolean;
  highlightBaseline: boolean;
  showTrace: boolean;
};
