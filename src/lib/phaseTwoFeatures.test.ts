import { describe, expect, it } from "vitest";
import { buildWorksheet } from "./buildWorksheet";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { getGuidelineStrokes } from "./guidelineStyle";
import { getHeaderFields, getWorksheetTitleY } from "./headerFields";
import { getHandwritingGlyph, ROUNDED_GLYPHS } from "./handwritingGlyphs";
import {
  getWorksheetTraceLayout,
  transformPracticeText,
} from "./traceLayout";
import { tracedColor } from "./traceStyle";
import { createWorksheetPdf } from "./exportWorksheetPdf";

function worksheet(patch: Partial<typeof defaultWorksheetConfig> = {}) {
  return buildWorksheet({ ...defaultWorksheetConfig, ...patch });
}

describe("Phase 2 handwriting and worksheet options", () => {
  it("provides four different guideline systems from shared SVG/PDF geometry", () => {
    const row = { top: 0, middle: 7, baseline: 14 };
    expect(getGuidelineStrokes(row, "classic", false).map((x) => x.position))
      .toEqual(["top", "middle", "baseline"]);
    expect(getGuidelineStrokes(row, "double", false).map((x) => x.position))
      .toEqual(["top", "baseline"]);
    expect(getGuidelineStrokes(row, "baseline", true).map((x) => x.position))
      .toEqual(["baseline"]);
    expect(getGuidelineStrokes(row, "color-cues", false).map((x) => x.color))
      .toEqual(["#5a9fce", "#a18bc4", "#db806a"]);
  });

  it("draws optional Name and Date fields within the page and below the title", () => {
    const both = worksheet({ showName: true, showDate: true });
    const fields = getHeaderFields(both);
    expect(fields.map((x) => x.label)).toEqual(["Name:", "Date:"]);
    expect(fields[0].textY).toBeGreaterThan(getWorksheetTitleY(both));
    expect(fields[0].textY).toBeLessThan(both.area.startY);
    expect(fields[0].lineEnd).toBeLessThan(fields[1].labelX);
    expect(fields[1].lineEnd).toBeCloseTo(both.area.startX + both.area.width);
    expect(getHeaderFields(worksheet())).toEqual([]);
    expect(getHeaderFields(worksheet({ showName: true }))).toHaveLength(1);
  });

  it("transforms case before preparing writing prompts", () => {
    expect(transformPracticeText("Hi there", "uppercase")).toBe("HI THERE");
    expect(transformPracticeText("Hi there", "lowercase")).toBe("hi there");
    expect(transformPracticeText("Hi there", "as-typed")).toBe("Hi there");
    const out = getWorksheetTraceLayout(worksheet({
      practiceText: "Ab", letterCase: "uppercase",
    }));
    expect(out.rows[0].text).toBe("AB");
  });

  it("supports one letter per row with repeated practice marks", () => {
    const out = getWorksheetTraceLayout(worksheet({
      practiceText: "Cat", promptStyle: "letter-by-letter",
    }));
    expect(out.rows[0].text.replace(/\s/g, "")).toBe("CCCCC");
    expect(out.rows[1].text.replace(/\s/g, "")).toBe("aaaaa");
    expect(out.rows[2].text.replace(/\s/g, "")).toBe("ttttt");
    expect(out.rows[3].placements).toHaveLength(0);
  });

  it("provides copying reference on first row, blank practice below", () => {
    const out = getWorksheetTraceLayout(worksheet({ practiceMode: "copy" }));
    expect(out.rows[0].placements.length).toBeGreaterThan(0);
    expect(out.rows[0].placements.every((item) => item.solid)).toBe(true);
    expect(out.rows.slice(1).every((row) => row.placements.length === 0)).toBe(true);
  });

  it("moves copying reference to the right for a left-handed writer", () => {
    const right = getWorksheetTraceLayout(worksheet({
      practiceMode: "copy", writingHand: "right",
    })).rows[0].placements[0].x;
    const left = getWorksheetTraceLayout(worksheet({
      practiceMode: "copy", writingHand: "left",
    })).rows[0].placements[0].x;
    expect(left).toBeGreaterThan(right);
  });

  it("fades tracing prompts gradually while retaining blank lines at the end", () => {
    const out = getWorksheetTraceLayout(worksheet({ practiceMode: "fade" }));
    expect(out.rows[0].placements[0].opacity).toBe(1);
    expect(out.rows[1].placements[0].opacity).toBeLessThan(1);
    expect(out.rows[1].placements[0].opacity).toBeGreaterThan(0);
    expect(out.rows.at(-1)!.placements).toHaveLength(0);
    expect(tracedColor(0)).toBe("#ffffff");
    expect(tracedColor(1)).toBe("#506b65");
  });

  it("omits prompts in blank mode and supports alternate manuscript variants", () => {
    const out = getWorksheetTraceLayout(worksheet({ practiceMode: "blank" }));
    expect(out.rows.every((row) => row.placements.length === 0)).toBe(true);
    for (const char of ["a", "g", "t", "I"]) {
      expect(ROUNDED_GLYPHS[char].strokes).not.toEqual(getHandwritingGlyph(char).strokes);
      expect(getHandwritingGlyph(char, "rounded")).toBe(ROUNDED_GLYPHS[char]);
    }
    expect(getHandwritingGlyph("B", "rounded")).toBe(getHandwritingGlyph("B"));
  });

  it("fades substantially across only the filled rows of long text", () => {
    const content = ["Alpha", "Bravo", "Charlie"].join(String.fromCharCode(10));
    const traced = getWorksheetTraceLayout(worksheet({
      practiceText: content, practiceMode: "trace",
    }));
    const faded = getWorksheetTraceLayout(worksheet({
      practiceText: content, practiceMode: "fade",
    }));
    expect(traced.rows[0].placements[0].opacity).toBe(1);
    expect(traced.rows[1].placements[0].opacity).toBe(1);
    expect(traced.rows[2].placements[0].opacity).toBe(1);
    expect(faded.rows[0].placements[0].opacity).toBe(1);
    expect(faded.rows[1].placements[0].opacity).toBeCloseTo(0.675);
    expect(faded.rows[2].placements[0].opacity).toBeCloseTo(0.35);
    expect(faded.rows[2].placements.length).toBeGreaterThan(0);
  });

  it("gives lowercase y a cleaner two-stroke descent without a reverse zigzag", () => {
    const y = getHandwritingGlyph("y");
    expect(y.strokes).toHaveLength(2);
    expect(y.strokes[0]).toContain("L 3.3 10");
    expect(y.strokes[1]).toContain("Q 2.4 14 1.1 13.4");
  });

  it("changes actual PDF glyph positions when character spacing increases", () => {
    const pdf = (spacing: number) => new TextDecoder().decode(createWorksheetPdf(
      worksheet({ practiceText: "ab", characterSpacing: spacing })
    ));
    expect(pdf(4)).not.toBe(pdf(0));
  });

  it("reports letter-by-letter overflow rather than silently hiding letters", () => {
    const out = getWorksheetTraceLayout(worksheet({
      practiceText: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      promptStyle: "letter-by-letter",
    }));
    expect(out.overflow).toBe(true);
  });

  it("exports A4 vectors, Name/Date fields, and copying or fading to PDF", () => {
    const decode = (patch: Partial<typeof defaultWorksheetConfig>) =>
      new TextDecoder().decode(createWorksheetPdf(worksheet(patch)));
    const a4 = decode({ paperSize: "a4", showName: true, showDate: true,
      lineStyle: "color-cues" });
    expect(a4).toContain("/MediaBox [0 0 595.276 841.89]");
    expect(a4).toContain("(Name:) Tj");
    expect(a4).toContain("(Date:) Tj");
    const trace = decode({ practiceMode: "trace" });
    const copy = decode({ practiceMode: "copy" });
    const fade = decode({ practiceMode: "fade" });
    const blank = decode({ practiceMode: "blank" });
    expect(copy).not.toBe(trace);
    expect(copy).toContain("[] 0 d");
    expect(fade).not.toBe(trace);
    expect(blank.length).toBeLessThan(trace.length);
  });
});
