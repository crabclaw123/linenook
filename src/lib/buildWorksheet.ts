import type { WorksheetConfig } from "../types/worksheet";
import type { WorksheetLayout } from "./generateWorksheetLayout";
import type { PageArea } from "./calculatePageArea";
import { PAGE_DIMENSIONS } from "./pageDimensions";
import { calculatePageArea } from "./calculatePageArea";
import { generateWorksheetLayout } from "./generateWorksheetLayout";
import { distributeRowSpacing } from "./distributeRowSpacing";
import { FIELD_HEADER_HEIGHT_MM } from "./headerFields";

export type Worksheet = Omit<WorksheetConfig, "paperSize" | "margin" | "rowHeight" | "writingHeight" | "fillPage" | "titleHeight"> & {
  paperSize: WorksheetConfig["paperSize"];
  pageWidth: number;
  pageHeight: number;
  pageLabel: string;
  area: PageArea;
  layout: WorksheetLayout;
};

export function buildWorksheet(config: WorksheetConfig): Worksheet {
  const page = PAGE_DIMENSIONS[config.paperSize];
  if (!page) {
    throw new Error("Unsupported paper size.");
  }
  const hasFields = config.showName || config.showDate;
  const area = calculatePageArea(
    page.width,
    page.height,
    config.margin,
    config.titleHeight + (hasFields ? FIELD_HEADER_HEIGHT_MM : 0)
  );

  const originalLayout = generateWorksheetLayout(
    area.startY,
    area.height,
    config.rowHeight,
    config.writingHeight
  );
  const layout = config.fillPage
    ? {
        rows: distributeRowSpacing(
          originalLayout.rows,
          area.height,
          config.rowHeight
        ),
      }
    : originalLayout;

  return {
    title: config.title,
    practiceText: config.practiceText,
    highlightBaseline: config.highlightBaseline,
    showTrace: config.showTrace,
    paperSize: config.paperSize,
    lineStyle: config.lineStyle,
    letterCase: config.letterCase,
    letterForm: config.letterForm,
    promptStyle: config.promptStyle,
    practiceMode: config.practiceMode,
    writingHand: config.writingHand,
    showName: config.showName,
    showDate: config.showDate,
    pageWidth: page.width,
    pageHeight: page.height,
    pageLabel: page.label,
    area,
    layout,
  };
}
