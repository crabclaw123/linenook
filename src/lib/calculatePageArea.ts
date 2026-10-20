export type PageArea = {
  startX: number;
  startY: number;
  width: number;
  height: number;
};

export function calculatePageArea(
  pageWidth: number,
  pageHeight: number,
  margin: number,
  titleHeight: number
): PageArea {
  if (
    !Number.isFinite(pageWidth) ||
    !Number.isFinite(pageHeight) ||
    !Number.isFinite(margin) ||
    !Number.isFinite(titleHeight)
  ) {
    throw new Error("Page dimensions must be finite numbers.");
  }

  if (pageWidth <= 0 || pageHeight <= 0) {
    throw new Error("Page dimensions must be positive.");
  }

  if (margin < 0 || titleHeight < 0) {
    throw new Error("Margin and title height cannot be negative.");
  }

  const width = pageWidth - margin * 2;
  const height = pageHeight - margin * 2 - titleHeight;

  if (width <= 0 || height <= 0) {
    throw new Error("Margins and title exceed the available page area.");
  }

  return {
    startX: margin,
    startY: margin + titleHeight,
    width,
    height,
  };
}