/** SVG and PDF share physical tracing measurements and color calculations. */
export const TRACE_STYLE = {
  color: "#506b65",
  strokeWidthMm: 0.68,
  dotLengthMm: 0.12,
  dotGapMm: 0.95,
} as const;

export function tracedColor(opacity: number): string {
  const alpha = Math.max(0, Math.min(1, opacity));
  const color = TRACE_STYLE.color;
  return "#" + [1, 3, 5].map((offset) => {
    const start = Number.parseInt(color.slice(offset, offset + 2), 16);
    return Math.round(255 * (1 - alpha) + start * alpha)
      .toString(16).padStart(2, "0");
  }).join("");
}
