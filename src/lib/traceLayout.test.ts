import { describe, expect, it } from "vitest";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { buildWorksheet } from "./buildWorksheet";
import { getWorksheetTraceLayout, measureTraceText, wrapTraceText } from "./traceLayout";
import { getHandwritingGlyph, isHandwritingCharacterSupported, LETTER_SPACING } from "./handwritingGlyphs";

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

  it("adds a physical millimeter gap between glyphs in both preview and PDF placements", () => {
    const normal = getWorksheetTraceLayout(buildWorksheet({
      ...defaultWorksheetConfig, practiceText: "Hello",
    }));
    const widened = getWorksheetTraceLayout(buildWorksheet({
      ...defaultWorksheetConfig, practiceText: "Hello", characterSpacing: 4,
    }));
    const [normalFirst, normalSecond] = normal.rows[0].placements;
    const [wideFirst, wideSecond] = widened.rows[0].placements;
    expect(wideFirst.x).toBe(normalFirst.x);
    expect(wideSecond.x - normalSecond.x).toBeCloseTo(4);
    expect(widened.rows[0].text).toBe("Hello");
    expect(normalFirst.scale).toBe(wideFirst.scale);
  });

  it("uses custom spacing to wrap long words before they reach the margin", () => {
    const spacedUnits = LETTER_SPACING + 5;
    const maxUnits = measureTraceText("abcd");
    const lines = wrapTraceText("abcd", maxUnits, "simple", spacedUnits);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe("abcd");
    for (const line of lines) {
      expect(measureTraceText(line, "simple", spacedUnits)).toBeLessThanOrEqual(maxUnits);
    }
  });

  it("fits repeated single-letter prompts within page bounds even with wide spacing", () => {
    const sheet = buildWorksheet({
      ...defaultWorksheetConfig,
      promptStyle: "letter-by-letter",
      writingHeight: 24, rowHeight: 38,
      characterSpacing: 8,
      practiceText: "w",
    });
    const firstRow = getWorksheetTraceLayout(sheet).rows[0];
    const last = firstRow.placements.at(-1)!;
    const right = last.x + last.glyph.width * last.scale;
    expect(right).toBeLessThanOrEqual(sheet.area.startX + sheet.area.width - 2 + 1e-7);
    expect(firstRow.placements.filter((placement) => placement.glyph.strokes.length > 0).length)
      .toBeGreaterThan(1);
  });

  it("keeps the aligned left-handed copy exemplar within the right page edge", () => {
    const worksheet = buildWorksheet({
      ...defaultWorksheetConfig,
      practiceMode: "copy",
      writingHand: "left",
      characterSpacing: 8,
      practiceText: "A B C D",
    });
    const layout = getWorksheetTraceLayout(worksheet);
    const last = layout.rows[0].placements.at(-1)!;
    const endpoint = last.x + last.glyph.width * last.scale;
    expect(endpoint).toBeLessThanOrEqual(
      worksheet.area.startX + worksheet.area.width - 2 + 0.001
    );
  });

  it("reports unsupported tracing characters instead of silently replacing them", () => {
    const worksheet = buildWorksheet({
      ...defaultWorksheetConfig,
      practiceText: "Café ★",
    });
    expect(getWorksheetTraceLayout(worksheet).unsupportedCharacters).toEqual(["é", "★"]);
  });
});
