import { describe, expect, it } from "vitest";
import { buildWorksheet } from "./buildWorksheet";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { createWorksheetPdf } from "./exportWorksheetPdf";
import { getWorksheetTraceLayout, wrapTraceText } from "./traceLayout";
import { LETTER_SPACING } from "./handwritingGlyphs";
import type { WorksheetConfig } from "../types/worksheet";

const sentence = "My name is Cam And I like seashells and turtles";

function layout(options: Partial<WorksheetConfig> = {}) {
  const worksheet = buildWorksheet({
    ...defaultWorksheetConfig,
    practiceText: sentence,
    ...options,
  });
  return { worksheet, tracing: getWorksheetTraceLayout(worksheet) };
}

function blockFor(worksheet: ReturnType<typeof buildWorksheet>): string[] {
  const writingHeight = worksheet.layout.rows[0].baseline -
    worksheet.layout.rows[0].top;
  const scale = writingHeight / 10;
  return wrapTraceText(
    worksheet.practiceText,
    (worksheet.area.width - 4) / scale,
    worksheet.letterForm,
    LETTER_SPACING + worksheet.characterSpacing / scale
  );
}

describe("QA: whole wrapped phrases repeat as complete practice blocks", () => {
  it("repeats every line of a multi-row sentence in order, no partial phrases", () => {
    const { worksheet, tracing } = layout({ writingHeight: 9, rowHeight: 16 });
    const block = blockFor(worksheet);
    expect(block.length).toBeGreaterThan(1);
    const copies = Math.floor(worksheet.layout.rows.length / block.length);
    expect(copies).toBeGreaterThan(1);
    expect(tracing.overflow).toBe(false);
    expect(tracing.rows.map((row) => row.text)).toEqual([
      ...Array.from({ length: copies }, () => block).flat(),
      ...Array(worksheet.layout.rows.length - copies * block.length).fill(""),
    ]);
  });

  it("reserves exactly the requested blank rows plus any incomplete remainder", () => {
    const { worksheet, tracing } = layout({
      writingHeight: 9, rowHeight: 16, blankPracticeRows: 3,
    });
    const block = blockFor(worksheet);
    const usable = worksheet.layout.rows.length - 3;
    const copies = Math.floor(usable / block.length);
    const printed = tracing.rows.filter((row) => row.text).length;
    expect(printed).toBe(copies * block.length);
    expect(tracing.rows.slice(-3).every((row) => row.text === "")).toBe(true);
    expect(tracing.rows.slice(-3).every((row) => row.placements.length === 0))
      .toBe(true);
    expect(tracing.overflow).toBe(false);
  });

  it("keeps original one-row repeating behavior and user-configured blanks", () => {
    const { worksheet, tracing } = layout({
      practiceText: "Hello", blankPracticeRows: 2,
    });
    expect(tracing.rows.slice(0, -2).every((row) => row.text === "Hello")).toBe(true);
    expect(tracing.rows.slice(-2).every((row) => row.text === "")).toBe(true);
    expect(tracing.rows).toHaveLength(worksheet.layout.rows.length);
  });

  it("Copy mode displays one complete wrapped model and then blank rows", () => {
    const { worksheet, tracing } = layout({
      practiceMode: "copy", writingHeight: 9, rowHeight: 16,
    });
    const block = blockFor(worksheet);
    expect(block.length).toBeGreaterThan(1);
    expect(tracing.rows.slice(0, block.length).map((row) => row.text))
      .toEqual(block);
    expect(tracing.rows.slice(block.length).every((row) => row.placements.length === 0))
      .toBe(true);
    expect(tracing.rows[0].placements.every((glyph) => glyph.solid)).toBe(true);
    expect(tracing.overflow).toBe(false);
  });

  it("Fade mode reduces visual guidance by full phrase repetition, not per line", () => {
    const { worksheet, tracing } = layout({
      practiceMode: "fade", writingHeight: 9, rowHeight: 16,
    });
    const block = blockFor(worksheet);
    const copies = Math.floor(worksheet.layout.rows.length / block.length);
    expect(copies).toBeGreaterThan(1);
    for (let copy = 0; copy < copies; copy++) {
      const group = tracing.rows.slice(copy * block.length, (copy + 1) * block.length);
      expect(group.map((r) => r.text)).toEqual(block);
      expect(group.every((row) => row.placements[0].opacity === group[0].placements[0].opacity))
        .toBe(true);
      if (copy > 0) {
        expect(group[0].placements[0].opacity).toBeLessThan(
          tracing.rows[(copy - 1) * block.length].placements[0].opacity
        );
      }
    }
  });

  it("signals overflow if even one complete phrase cannot fit in reserved space", () => {
    const { worksheet, tracing } = layout({
      writingHeight: 14, rowHeight: 24, blankPracticeRows: 8,
    });
    expect(blockFor(worksheet).length).toBeGreaterThan(1);
    expect(tracing.overflow).toBe(true);
    expect(tracing.rows.slice(1).every((row) => row.placements.length === 0))
      .toBe(true);
  });

  it("preserves per-character mode and respects reserved rows", () => {
    const { tracing } = layout({
      practiceText: "Cat", promptStyle: "letter-by-letter",
      blankPracticeRows: 2,
    });
    expect(tracing.rows[0].text.replaceAll(" ", "")).toBe("CCCCC");
    expect(tracing.rows[1].text.replaceAll(" ", "")).toBe("aaaaa");
    expect(tracing.rows[2].text.replaceAll(" ", "")).toBe("ttttt");
    expect(tracing.rows.slice(-2).every((row) => row.placements.length === 0))
      .toBe(true);
  });

  it("exports every repeated row to the vector PDF, not just the first phrase", () => {
    const { worksheet, tracing } = layout({
      writingHeight: 9, rowHeight: 16, blankPracticeRows: 2,
    });
    const pdf = new TextDecoder().decode(createWorksheetPdf(worksheet));
    const glyphCount = tracing.rows.reduce((sum, row) => sum + row.placements.length, 0);
    // The PDF renderer applies a round line-cap for each traced glyph placement.
    const tracedGlyphs = pdf.match(/1 J\n1 j/g) ?? [];
    expect(tracedGlyphs).toHaveLength(glyphCount);
    expect(glyphCount).toBeGreaterThan(
      tracing.rows[0].placements.length * blockFor(worksheet).length
    );
  });
});
