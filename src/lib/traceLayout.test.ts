import { describe, expect, it } from "vitest";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { buildWorksheet } from "./buildWorksheet";
import { getWorksheetTraceLayout, measureTraceText, wrapTraceText } from "./traceLayout";
import { getHandwritingGlyph, isHandwritingCharacterSupported } from "./handwritingGlyphs";

describe("single-stroke handwriting geometry", () => {
  it("supports uppercase, lowercase, digits and useful punctuation", () => {
    for (const character of "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,' -") {
      expect(isHandwritingCharacterSupported(character)).toBe(true);
      expect(getHandwritingGlyph(character).width).toBeGreaterThan(0);
    }
  });

  it("measures words wider than letters and wraps at available width", () => {
    expect(measureTraceText("Hello world")).toBeGreaterThan(measureTraceText("Hello"));
    const maxUnits = Math.max(measureTraceText("Hello"), measureTraceText("world"));
    expect(wrapTraceText("Hello world", maxUnits)).toEqual(["Hello", "world"]);
  });

  it("splits a long word without clipping past the page", () => {
    const maxUnits = measureTraceText("abc");
    const lines = wrapTraceText("abcdefgh", maxUnits);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe("abcdefgh");
    for (const line of lines) {
      expect(measureTraceText(line)).toBeLessThanOrEqual(maxUnits);
    }
  });

  it("repeats short words on each line and respects the trace toggle", () => {
    const worksheet = buildWorksheet(defaultWorksheetConfig);
    const layout = getWorksheetTraceLayout(worksheet);
    expect(layout.rows).toHaveLength(9);
    expect(layout.rows.every((row) => row.text === "Hello")).toBe(true);
    expect(layout.rows[0].placements.length).toBe(5);
    const blank = getWorksheetTraceLayout(buildWorksheet({
      ...defaultWorksheetConfig,
      showTrace: false,
    }));
    expect(blank.rows.every((row) => row.placements.length === 0)).toBe(true);
  });

  it("reports overflow instead of silently hiding it", () => {
    const worksheet = buildWorksheet({
      ...defaultWorksheetConfig,
      practiceText: Array.from({ length: 120 }, () => "a").join(""),
      writingHeight: 24,
      rowHeight: 38,
    });
    const layout = getWorksheetTraceLayout(worksheet);
    expect(layout.overflow).toBe(true);
    expect(layout.rows.length).toBe(6);
  });

  it("reports unsupported tracing characters instead of silently replacing them", () => {
    const worksheet = buildWorksheet({
      ...defaultWorksheetConfig,
      practiceText: "Café ★",
    });
    expect(getWorksheetTraceLayout(worksheet).unsupportedCharacters).toEqual(["é", "★"]);
  });
});
