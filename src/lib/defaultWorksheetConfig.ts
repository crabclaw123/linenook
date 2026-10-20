import type { WorksheetConfig } from "../types/worksheet";

export const defaultWorksheetConfig: WorksheetConfig = {
  title: "My Handwriting Practice",
  practiceText: "Hello",
  paperSize: "letter",
  margin: 12.7,
  titleHeight: 20,
  rowHeight: 24,
  writingHeight: 14,
  fillPage: true,
  highlightBaseline: false,
  showTrace: true,
  lineStyle: "classic",
  letterCase: "as-typed",
  letterForm: "simple",
  promptStyle: "whole",
  practiceMode: "trace",
  writingHand: "right",
  showName: false,
  showDate: false,
};
