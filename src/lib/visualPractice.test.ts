import { describe, expect, it } from "vitest";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { buildWorksheet } from "./buildWorksheet";
import { getWorksheetTraceLayout, wrapIndexedTraceText } from "./traceLayout";
import {
  applyTextStyle, HIGHLIGHT_COLORS, rebaseTextMarks,
  sanitizeTextMarks, textStyleAt,
} from "./textMarks";
import { PREWRITING_SHAPES } from "./prewritingShapes";
import { createWorksheetPdf } from "./exportWorksheetPdf";
import { parsePresetFile, serializePresetFile, portablePresetFilename } from "./presetFile";
import { ACTIVITY_CATEGORIES, ACTIVITY_TEMPLATES, applyActivityTemplate } from "./activityTemplates";
import { normalizeWorksheetConfig } from "./worksheetStorage";
import type { WorksheetConfig } from "../types/worksheet";

const phrase = "The cat is small";
const baseline = (): WorksheetConfig => ({
  ...defaultWorksheetConfig, title: "Cat Practice", practiceText: phrase,
});

describe("Phase 3 — selection-based handwriting cues", () => {
  it("applies color and mixed-mode overrides without losing unrelated styling", () => {
    const initial = applyTextStyle([], phrase.length, 4, 7, { highlight: "yellow" });
    const next = applyTextStyle(initial, phrase.length, 4, 7, { mode: "trace" });
    const copied = applyTextStyle(next, phrase.length, 0, phrase.length,
      { mode: "copy" });
    expect(textStyleAt(next, 4)).toMatchObject({
      highlight: "yellow", mode: "trace",
    });
    // Last edit changes mode, not color.
    expect(textStyleAt(copied, 4).highlight).toBe("yellow");
    expect(textStyleAt(copied, 4).mode).toBe("copy");
    const reset = applyTextStyle(copied, phrase.length, 4, 7, {
      highlight: null, mode: null,
    });
    expect(textStyleAt(reset, 5).highlight).toBeUndefined();
    expect(textStyleAt(reset, 5).mode).toBeUndefined();
    expect(textStyleAt(reset, 1).mode).toBe("copy");
  });

  it("only changes the selected word, preserving other words and whitespace", () => {
    let marks = applyTextStyle([], phrase.length, 0, phrase.length, { mode: "copy" });
    marks = applyTextStyle(marks, phrase.length, 4, 7, {
      mode: "trace", highlight: "yellow",
    });
    const sheet = buildWorksheet({ ...baseline(), textMarks: marks });
    const result = getWorksheetTraceLayout(sheet);
    const first = result.rows[0].placements;
    const cat = first.filter((placement) => placement.sourceIndex !== undefined &&
      placement.sourceIndex >= 4 && placement.sourceIndex < 7);
    const other = first.filter((placement) => placement.sourceIndex !== undefined &&
      placement.sourceIndex >= 0 && placement.sourceIndex < 3);
    expect(cat).toHaveLength(3);
    expect(cat.every((p) => p.highlight === "yellow" && !p.solid)).toBe(true);
    expect(other.every((p) => p.solid && !p.highlight)).toBe(true);
    expect(result.rows[1].placements.filter((p) => p.highlight === "yellow"))
      .toHaveLength(3);
    const pdf = new TextDecoder().decode(createWorksheetPdf(sheet));
    expect(pdf).toContain("re f");
    expect(pdf).toContain("[] 0 d");
  });

  it("preserves selected indices even when sentence wraps and repeats", () => {
    const long = "The quick brown cat eats fish and sleeps on a mat";
    const start = long.indexOf("cat");
    const marks = applyTextStyle([], long.length, start, start + 3, {
      highlight: "mint", mode: "copy",
    });
    const config = {
      ...baseline(), writingHeight: 14, rowHeight: 24,
      margin: 25, practiceText: long, textMarks: marks,
      characterSpacing: 3, showTrace: true,
    };
    const layout = getWorksheetTraceLayout(buildWorksheet(config));
    expect(layout.rows[0].placements.length).toBeGreaterThan(0);
    const copies = layout.rows.flatMap((row) => row.placements)
      .filter((p) => p.highlight === "mint");
    expect(copies.length).toBeGreaterThanOrEqual(3);
    expect(copies.length % 3).toBe(0);
    expect(copies.every((p) => p.solid)).toBe(true);
    expect(copies.map((p) => p.sourceIndex)).toEqual(
      Array.from({length: copies.length / 3}, () => [start, start+1, start+2]).flat()
    );
    expect(new TextDecoder().decode(createWorksheetPdf(buildWorksheet(config))))
      .toContain("re f");
  });

  it("handles explicit line breaks without attaching formatting to another word", () => {
    const text = "The dog\nlikes cat";
    const lines = wrapIndexedTraceText(text, "as-typed", 1000);
    expect(lines.map((x) => x.text)).toEqual(["The dog", "likes cat"]);
    expect(lines[1].chars.at(-3)?.sourceIndex).toBe(text.indexOf("cat"));
  });

  it("allows individual word overrides even when the worksheet-wide mode is blank", () => {
    const marks = applyTextStyle([], phrase.length, 4, 7, { mode: "trace" });
    const sheet = buildWorksheet({
      ...baseline(), practiceMode: "blank", showTrace: true, textMarks: marks,
    });
    const first = getWorksheetTraceLayout(sheet).rows[0].placements;
    expect(first.map((p) => p.sourceIndex)).toEqual([4, 5, 6]);
    expect(first.every((p) => p.solid === false)).toBe(true);
  });

  it("preserves untouched styles during text edits and drops intersecting annotations", () => {
    const marks = applyTextStyle([], phrase.length, 4, 7, {
      mode: "fade", highlight: "peach",
    });
    const prepended = "Start: " + phrase;
    const moved = rebaseTextMarks(marks, phrase, prepended);
    expect(moved).toEqual([{ start: 11, end: 14,
      mode: "fade", highlight: "peach" }]);
    expect(rebaseTextMarks(marks, phrase, "The dog is small")).toEqual([]);
    expect(rebaseTextMarks(marks, phrase, phrase)).toEqual(marks);
  });

  it("sanitizes imported marks, clamps bounds and ignores malicious entries", () => {
    const raw = [
      { start: 4, end: 7, mode: "trace", highlight: "yellow" },
      { start: -1, end: 9999, mode: "unknown", highlight: "mint" },
      { start: 3, end: 4, mode: "script" },
      { start: NaN, end: 3, mode: "trace" },
    ];
    const safe = sanitizeTextMarks(raw, phrase.length);
    expect(safe.every((m) => m.start >= 0 && m.end <= phrase.length)).toBe(true);
    expect(textStyleAt(safe, 5).highlight).toBe("mint");
    expect(textStyleAt(safe, 5).mode).toBe("trace");
    expect(Object.keys(HIGHLIGHT_COLORS)).toEqual(["yellow", "mint", "peach"]);
  });
});

describe("Phase 3 — printable prewriting shapes", () => {
  it("includes original vector geometry for eight shapes", () => {
    expect(Object.keys(PREWRITING_SHAPES)).toHaveLength(8);
    for (const shape of Object.values(PREWRITING_SHAPES)) {
      expect(shape.glyph.width).toBeGreaterThan(0);
      expect(shape.glyph.strokes.length).toBeGreaterThan(0);
      expect(shape.glyph.strokes.every((path) => path.startsWith("M "))).toBe(true);
    }
  });

  it("uses shape paths across multiple rows with a vector PDF", () => {
    const sheet = buildWorksheet({
      ...baseline(), activityType: "shapes", shapeId: "circle",
      lineStyle: "double", blankPracticeRows: 2,
    });
    const traced = getWorksheetTraceLayout(sheet);
    expect(traced.rows[0].placements.length).toBeGreaterThan(1);
    expect(traced.rows[0].placements[0].glyph)
      .toBe(PREWRITING_SHAPES.circle.glyph);
    expect(traced.rows.slice(-2).every((r) => !r.placements.length)).toBe(true);
    const pdf = new TextDecoder().decode(createWorksheetPdf(sheet));
    expect(pdf).toContain(" c");
    expect(pdf).toContain("% LineNook");
    expect(traced.unsupportedCharacters).toEqual([]);
  });

  it("grades shapes as trace, copy, fade and blank", () => {
    const make = (practiceMode: WorksheetConfig["practiceMode"]) =>
      getWorksheetTraceLayout(buildWorksheet({
        ...baseline(), activityType: "shapes", shapeId: "zigzag", practiceMode,
      }));
    const traced = make("trace"), copied = make("copy"),
      faded = make("fade"), blank = make("blank");
    expect(traced.rows[1].placements.length).toBeGreaterThan(1);
    expect(copied.rows[0].placements.every((p) => p.solid)).toBe(true);
    expect(copied.rows[1].placements).toHaveLength(0);
    expect(faded.rows[0].placements[0].opacity).toBe(1);
    expect(faded.rows[3].placements[0].opacity).toBeLessThan(1);
    expect(blank.rows.every((row) => row.placements.length === 0)).toBe(true);
  });

  it("centers printable paths within both US Letter and A4 writing areas", () => {
    for (const paperSize of ["letter", "a4"] as const) {
      const sheet = buildWorksheet({
        ...baseline(), paperSize, activityType: "shapes",
        shapeId: "spiral", writingHeight: 20, rowHeight: 32,
        characterSpacing: 8,
      });
      const first = getWorksheetTraceLayout(sheet).rows[0].placements;
      const end = first.at(-1)!;
      expect(first[0].x).toBeGreaterThan(sheet.area.startX);
      expect(end.x + end.glyph.width * end.scale)
        .toBeLessThanOrEqual(sheet.area.startX + sheet.area.width);
    }
  });
});

describe("Phase 3 — worksheet activity library and portable presets", () => {
  it("has distinct categories and editable name, themed and letter-progressions", () => {
    expect(ACTIVITY_CATEGORIES).toHaveLength(4);
    for (const category of ACTIVITY_CATEGORIES) {
      expect(ACTIVITY_TEMPLATES.some((t) => t.category === category)).toBe(true);
    }
    expect(ACTIVITY_TEMPLATES.length).toBeGreaterThanOrEqual(12);
    const template = ACTIVITY_TEMPLATES.find((item) => item.id === "tail-letters")!;
    const prior = {
      ...baseline(),
      textMarks: applyTextStyle([], phrase.length, 4, 7, { highlight: "yellow" }),
    };
    const result = applyActivityTemplate(prior, template);
    expect(result.textMarks).toEqual([]);
    expect(result.activityType).toBe("text");
    expect(result.promptStyle).toBe("letter-by-letter");
  });

  it("exports and imports a full styled worksheet config without a backend", () => {
    const config = {
      ...baseline(), activityType: "text" as const, paperSize: "a4" as const,
      textMarks: applyTextStyle([], phrase.length, 4, 7, {
        mode: "trace", highlight: "yellow",
      }),
    };
    const portable = serializePresetFile("Class set", config);
    const imported = parsePresetFile(portable);
    expect(imported.name).toBe("Class set");
    expect(imported.config).toMatchObject(config);
    expect(portablePresetFilename("A test : worksheet"))
      .toBe("linenook-a-test-worksheet-preset.json");
    expect(() => parsePresetFile("bad-json")).toThrow("valid JSON");
    expect(() => parsePresetFile(JSON.stringify({
      format: "different", version: 1, name: "invalid", config,
    }))).toThrow("unsupported");
  });

  it("safely restores saved shape and styled-text data from older versions", () => {
    const previous = { ...baseline() } as Partial<WorksheetConfig>;
    delete previous.activityType;
    delete previous.shapeId;
    delete previous.textMarks;
    const normalized = normalizeWorksheetConfig(previous);
    expect(normalized.activityType).toBe("text");
    expect(normalized.shapeId).toBe("circle");
    expect(normalized.textMarks).toEqual([]);
  });
});
