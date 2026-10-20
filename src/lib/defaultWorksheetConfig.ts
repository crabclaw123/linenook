import type { WorksheetConfig } from "../types/worksheet";

export const defaultWorksheetConfig: WorksheetConfig = {
  title: "My Handwriting Practice",
  practiceText: "Hello",
  paperSize: "letter",
  margin: 12.7,
  titleHeight: 20,
  // Everyday preset: 14 mm writing zone + 10 mm gap for descenders.
  rowHeight: 24,
  writingHeight: 14,
  fillPage: true,
  highlightBaseline: false,
  showTrace: true,
};
