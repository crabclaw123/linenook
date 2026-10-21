import type { PaperSize } from "../types/worksheet";

export type PageDimensions = { width: number; height: number; label: string };

export const US_LETTER: PageDimensions = {
  width: 215.9,
  height: 279.4,
  label: "US Letter · 8.5 × 11 in",
};

export const A4: PageDimensions = {
  width: 210,
  height: 297,
  label: "A4 · 210 × 297 mm",
};

export const PAGE_DIMENSIONS: Record<PaperSize, PageDimensions> = {
  letter: US_LETTER,
  a4: A4,
};
