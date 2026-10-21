import type { LineStyle } from "../types/worksheet";
import type { Guidelines } from "./calculateGuidelines";

export type GuidelineStroke = {
  position: "top" | "middle" | "baseline";
  y: number;
  color: string;
  widthMm: number;
  dashMm?: [number, number];
};

/** Single source of truth shared by the live SVG preview and PDF export. */
export function getGuidelineStrokes(
  row: Guidelines,
  style: LineStyle,
  highlightedBaseline: boolean
): GuidelineStroke[] {
  const top: GuidelineStroke = {
    position: "top", y: row.top, color: "#7998a0", widthMm: 0.32,
  };
  const mid: GuidelineStroke = {
    position: "middle", y: row.middle, color: "#94aab1",
    widthMm: 0.27, dashMm: [1.8, 1.5],
  };
  const base: GuidelineStroke = {
    position: "baseline", y: row.baseline,
    color: highlightedBaseline ? "#df9869" : "#65858c",
    widthMm: highlightedBaseline ? 0.65 : 0.4,
  };

  switch (style) {
    case "color-cues":
      return [
        { ...top, color: "#5a9fce", widthMm: 0.48 },
        { ...mid, color: "#a18bc4", widthMm: 0.42 },
        { ...base, color: "#db806a", widthMm: 0.62 },
      ];
    case "double":
      return [top, base];
    case "baseline":
      return [base];
    case "classic":
    default:
      return [top, mid, base];
  }
}
