import type { WorksheetConfig } from "../types/worksheet";
import type { WorksheetLayout } from "./generateWorksheetLayout";
import type { PageArea } from "./calculatePageArea";

import { US_LETTER } from "./pageDimensions";
import { calculatePageArea } from "./calculatePageArea";
import { generateWorksheetLayout } from "./generateWorksheetLayout";

export type Worksheet = {
  pageWidth: number;
  pageHeight: number;
  area: PageArea;
  layout: WorksheetLayout;
  title: string;
  practiceText: string;
  highlightBaseline: boolean;
};

export function buildWorksheet(config: WorksheetConfig): Worksheet {
  const page = US_LETTER;

  const area = calculatePageArea(
    page.width,
    page.height,
    config.margin,
    config.titleHeight
  );

  const layout = generateWorksheetLayout(
    area.startY,
    area.height,
    config.rowHeight,
    config.writingHeight
  );

  return {
    pageWidth: page.width,
    pageHeight: page.height,
    area,
    layout,
    title: config.title,
    practiceText: config.practiceText,
    highlightBaseline: config.highlightBaseline,
  };
}