/**
 * Shared physical tracing stroke measurements (in millimeters).
 * SVG's scaled glyph coordinates and PDF's absolute page coordinates
 * both use these values so print matches the on-screen preview.
 */
export const TRACE_STYLE = {
  color: "#506b65",
  strokeWidthMm: 0.76,
  dotLengthMm: 0.12,
  dotGapMm: 1.18,
} as const;
