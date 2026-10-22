import type { ShapeId } from "../types/worksheet";
import type { HandwritingGlyph } from "./handwritingGlyphs";

/** Original printable vector shapes, not a commercial curriculum. */
export const PREWRITING_SHAPES: Readonly<Record<ShapeId, {
  label: string;
  description: string;
  glyph: HandwritingGlyph;
}>> = {
  horizontal: {
    label: "Horizontal line", description: "Left-to-right strokes",
    glyph: { width: 11, strokes: ["M 1 5 L 10 5"] },
  },
  vertical: {
    label: "Vertical line", description: "Top-to-bottom strokes",
    glyph: { width: 11, strokes: ["M 5.5 0.8 L 5.5 9.2"] },
  },
  wave: {
    label: "Wave", description: "Smooth flowing curves",
    glyph: { width: 11, strokes: ["M .5 5 C 2 0.2 4 0.2 5.5 5 C 7 9.8 9 9.8 10.5 5"] },
  },
  zigzag: {
    label: "Zigzag", description: "Changing diagonal directions",
    glyph: { width: 11, strokes: ["M .5 8.8 L 2.9 1.2 L 5.5 8.8 L 8 1.2 L 10.5 8.8"] },
  },
  circle: {
    label: "Circle", description: "Round closed shape",
    glyph: { width: 11, strokes: [
      "M 5.5 .9 C 11 .9 11 9.1 5.5 9.1 C 0 9.1 0 .9 5.5 .9",
    ] },
  },
  square: {
    label: "Square", description: "Four sides and corners",
    glyph: { width: 11, strokes: [
      "M 1.4 1 L 9.6 1 L 9.6 9 L 1.4 9 L 1.4 1",
    ] },
  },
  triangle: {
    label: "Triangle", description: "Three connected strokes",
    glyph: { width: 11, strokes: [
      "M 5.5 .7 L 10 9.2 L 1 9.2 L 5.5 .7",
    ] },
  },
  spiral: {
    label: "Spiral", description: "Continuous inward curve",
    glyph: { width: 11, strokes: [
      "M 5.5 .6 C 11 .6 11 9.4 5.5 9.4 C .2 9.4 .2 1.8 5.3 1.8 C 9.4 1.8 9.4 8 5.4 8 C 2.1 8 2.1 3.2 5.5 3.2 C 7.7 3.2 7.7 6.6 5.5 6.6",
    ] },
  },
};
