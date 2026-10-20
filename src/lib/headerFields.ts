import type { Worksheet } from "./buildWorksheet";

export type HeaderField = {
  label: "Name:" | "Date:";
  labelX: number;
  textY: number;
  lineStart: number;
  lineEnd: number;
};

export const FIELD_HEADER_HEIGHT_MM = 13;

/** Header positioning is shared by SVG and PDF. */
export function getWorksheetTitleY(worksheet: Worksheet): number {
  return worksheet.area.startY - (worksheet.showName || worksheet.showDate
    ? FIELD_HEADER_HEIGHT_MM : 0) - 7;
}

export function getHeaderFields(worksheet: Worksheet): HeaderField[] {
  const { showName, showDate, area } = worksheet;
  if (!showName && !showDate) return [];
  const textY = getWorksheetTitleY(worksheet) + 12;
  const right = area.startX + area.width;

  if (showName && showDate) {
    const dateX = area.startX + area.width * 0.64;
    return [
      {
        label: "Name:", labelX: area.startX, textY,
        lineStart: area.startX + 14, lineEnd: dateX - 6,
      },
      {
        label: "Date:", labelX: dateX, textY,
        lineStart: dateX + 12, lineEnd: right,
      },
    ];
  }
  return [{
    label: showName ? "Name:" : "Date:",
    labelX: area.startX, textY,
    lineStart: area.startX + 14, lineEnd: right,
  }];
}
