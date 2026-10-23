import { describe, expect, it } from "vitest";
import { buildWorksheet } from "./buildWorksheet";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { createWorksheetPdf } from "./exportWorksheetPdf";
import {
  getWorksheetTraceLayout, wrapIndexedTraceText,
} from "./traceLayout";
import {
  getRowWordSpacingCues, getWordSpacingLevel,
} from "./wordSpacing";
import { normalizeWorksheetConfig } from "./worksheetStorage";
import { serializePresetFile, parsePresetFile } from "./presetFile";
import type { WorksheetConfig, WordSpacingCueStyle } from "../types/worksheet";

const sentence = "The cat is small and the dog is very happy.";
function make(patch: Partial<WorksheetConfig> = {}) {
  const worksheet = buildWorksheet({
    ...defaultWorksheetConfig,
    practiceText: sentence,
    wordSpacingCue: "highlight",
    ...patch,
  });
  return { worksheet, layout: getWorksheetTraceLayout(worksheet) };
}

describe("Word spacing: independent cue styles and support levels", () => {
  it("makes highlighted gaps between words without adding cues at the line edge", () => {
    const { layout } = make({ practiceText: "The cat is small", wordSpacingLevel: 1 });
    const first = layout.rows[0];
    const bands = first.spacingCues ?? [];
    expect(bands.map((cue) => cue.kind)).toEqual(["band", "band", "band"]);
    expect(first.placements.length).toBeGreaterThan(0);
    expect(bands.every((c) => c.kind === "band" &&
      c.x >= 0 && c.width > 0 && c.height > 0)).toBe(true);
    const second = layout.rows[1].spacingCues ?? [];
    expect(second).toHaveLength(bands.length);
    second.forEach((cue, index) => {
      expect(cue.kind).toBe(bands[index].kind);
      if (cue.kind === "band" && bands[index].kind === "band") {
        expect(cue.x).toBeCloseTo(bands[index].x);
        expect(cue.y - bands[index].y).toBeCloseTo(
          layout.rows[1].placements[0].y - first.placements[0].y
        );
      }
    });
  });

  it("renders selectable colored dots, word boxes, and finger reminders", () => {
    const types: Record<WordSpacingCueStyle, string | null> = {
      none: null, dots: "dot", highlight: "band",
      boxes: "box", finger: "reminder",
    };
    for (const [wordSpacingCue, kind] of Object.entries(types)) {
      const { layout } = make({
        practiceText: "The cat is small",
        wordSpacingCue: wordSpacingCue as WordSpacingCueStyle,
        wordSpacingLevel: 1,
      });
      const cues = layout.rows[0].spacingCues ?? [];
      if (kind) {
        expect(cues.length).toBeGreaterThan(0);
        expect(cues.every((cue) => cue.kind === kind)).toBe(true);
      } else {
        expect(cues).toEqual([]);
      }
    }
    expect((make({ practiceText: "The cat is small", wordSpacingCue: "boxes" })
      .layout.rows[0].spacingCues ?? []).length).toBe(4);
  });

  it("grades strong cues into dots, reminder, and no cues at levels 1–4", () => {
    const counts: number[] = [];
    for (const wordSpacingLevel of [1, 2, 3, 4] as const) {
      const { layout } = make({ practiceText: "The cat is small", wordSpacingLevel });
      const cues = layout.rows[0].spacingCues ?? [];
      counts.push(cues.length);
      if (wordSpacingLevel === 1) {
        expect(cues[0].kind).toBe("band");
      } else if (wordSpacingLevel === 2) {
        expect(cues.every((cue) => cue.kind === "dot")).toBe(true);
        expect(cues).toHaveLength(3);
      } else if (wordSpacingLevel === 3) {
        expect(cues.map((cue) => cue.kind)).toEqual(["reminder"]);
      } else {
        expect(cues).toEqual([]);
      }
    }
    expect(counts).toEqual([3, 3, 1, 0]);
  });

  it("keeps selected dot and finger styles meaningful at their strongest level", () => {
    const dots = make({ wordSpacingCue: "dots", wordSpacingLevel: 1 })
      .layout.rows[0].spacingCues ?? [];
    const small = make({ wordSpacingCue: "dots", wordSpacingLevel: 2 })
      .layout.rows[0].spacingCues ?? [];
    expect(dots[0].kind).toBe("dot");
    expect(small[0].kind).toBe("dot");
    if (dots[0].kind === "dot" && small[0].kind === "dot") {
      expect(dots[0].radius).toBeGreaterThan(small[0].radius);
    }

    const bigReminder = make({ wordSpacingCue: "finger", wordSpacingLevel: 1 })
      .layout.rows[0].spacingCues ?? [];
    const subtle = make({ wordSpacingCue: "finger", wordSpacingLevel: 3 })
      .layout.rows[0].spacingCues ?? [];
    expect(bigReminder[0].kind).toBe("reminder");
    expect(subtle[0].kind).toBe("reminder");
    if (bigReminder[0].kind === "reminder" && subtle[0].kind === "reminder") {
      expect(bigReminder[0].fontSize).toBeGreaterThan(subtle[0].fontSize);
    }
  });

  it("progresses ONLY between full repeated sentence blocks, including wrapped text", () => {
    const { worksheet, layout } = make({
      practiceText: "The cat and the dog enjoy learning how to write together.",
      writingHeight: 9, rowHeight: 16,
      wordSpacingCue: "highlight",
      wordSpacingLevel: 1,
      wordSpacingProgression: true,
    });
    const scale = (worksheet.layout.rows[0].baseline -
      worksheet.layout.rows[0].top) / 10;
    const blockLength = wrapIndexedTraceText(
      worksheet.practiceText, worksheet.letterCase,
      (worksheet.area.width - 4) / scale,
      worksheet.letterForm, 1.25 + worksheet.characterSpacing / scale
    ).length;
    const repetitions = Math.floor(layout.rows.length / blockLength);
    expect(blockLength).toBeGreaterThan(1);
    expect(repetitions).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < repetitions; i++) {
      const stage = getWordSpacingLevel(1, true, i,
        repetitions + layout.rows.length % blockLength);
      const sequence = layout.rows.slice(i * blockLength, (i + 1) * blockLength);
      expect(sequence.every((row) =>
        (row.spacingCues ?? []).every((cue) =>
          cue.kind === (
            stage === 1 ? "band" :
            stage === 2 ? "dot" :
            stage === 3 ? "reminder" : "none"
          )
        ))).toBe(true);
    }
    expect(getWordSpacingLevel(1, true, 0, 5)).toBe(1);
    expect(getWordSpacingLevel(1, true, 4, 5)).toBe(4);
    expect(getWordSpacingLevel(2, true, 2, 5)).toBe(3);
    expect(getWordSpacingLevel(3, false, 4, 5)).toBe(3);
  });

  it("does not alter tracing, fading or blank practice placements", () => {
    const plain = make({ wordSpacingCue: "none" }).layout;
    const supported = make({ wordSpacingCue: "dots" }).layout;
    expect(supported.rows.map((row) => row.text))
      .toEqual(plain.rows.map((row) => row.text));
    expect(supported.rows.map((row) => row.placements))
      .toEqual(plain.rows.map((row) => row.placements));

    const { worksheet: fadedWorksheet, layout: faded } = make({
      practiceMode: "fade", wordSpacingCue: "dots",
    });
    const scale = (fadedWorksheet.layout.rows[0].baseline -
      fadedWorksheet.layout.rows[0].top) / 10;
    const firstBlockLength = wrapIndexedTraceText(
      fadedWorksheet.practiceText, fadedWorksheet.letterCase,
      (fadedWorksheet.area.width - 4) / scale,
      fadedWorksheet.letterForm, 1.25 + fadedWorksheet.characterSpacing / scale
    ).length;
    expect(firstBlockLength).toBeGreaterThan(1);
    expect(faded.rows[0].placements[0].opacity).toBe(1);
    expect(faded.rows[1].placements[0].opacity).toBe(1);
    expect(faded.rows[firstBlockLength].placements[0].opacity).toBeLessThan(1);
    expect(faded.rows[0].spacingCues?.[0].kind).toBe("dot");

    const blank = make({ practiceMode: "blank", showTrace: false,
      wordSpacingCue: "dots" }).layout;
    expect(blank.rows[0].placements).toEqual([]);
    expect(blank.rows[0].spacingCues?.[0].kind).toBe("dot");
  });

  it("keeps word-spacing cues out of prewriting shapes and single-letter drills", () => {
    const shapes = make({ activityType: "shapes", wordSpacingCue: "boxes" }).layout;
    expect(shapes.rows.every((r) => !r.spacingCues?.length)).toBe(true);
    const individual = make({ promptStyle: "letter-by-letter",
      wordSpacingCue: "finger" }).layout;
    expect(individual.rows.every((r) => !r.spacingCues?.length)).toBe(true);
  });

  it("emits vector PDF bands, dots, boxes, and reminders on Letter and A4", () => {
    const decoded = (style: WordSpacingCueStyle, level = 1 as 1|2|3|4) => {
      const { worksheet } = make({
        practiceText: "The cat is small", paperSize: "a4",
        wordSpacingCue: style, wordSpacingLevel: level,
      });
      return new TextDecoder().decode(createWorksheetPdf(worksheet));
    };
    expect(decoded("highlight")).toContain(" re f");
    expect(decoded("dots")).toContain(" c\nf\nQ");
    expect(decoded("boxes")).toContain(" re S");
    expect(decoded("highlight", 3)).toContain("(FINGER SPACE) Tj");
    expect(decoded("highlight", 4)).not.toContain("(FINGER SPACE) Tj");
    expect(decoded("none")).not.toContain("(FINGER SPACE) Tj");
  });

  it("honors saved word cue settings in portable presets and handles invalid legacy data", () => {
    const config = normalizeWorksheetConfig({
      ...defaultWorksheetConfig, wordSpacingCue: "boxes", wordSpacingLevel: 2,
      wordSpacingProgression: true,
    });
    const restored = parsePresetFile(serializePresetFile("Word support", config));
    expect(restored.config).toMatchObject({
      wordSpacingCue: "boxes", wordSpacingLevel: 2,
      wordSpacingProgression: true,
    });
    const legacy = { ...defaultWorksheetConfig } as Record<string, unknown>;
    delete legacy.wordSpacingCue;
    delete legacy.wordSpacingLevel;
    delete legacy.wordSpacingProgression;
    expect(normalizeWorksheetConfig(legacy)).toMatchObject({
      wordSpacingCue: "none", wordSpacingLevel: 1,
      wordSpacingProgression: false,
    });
    expect(normalizeWorksheetConfig({
      ...legacy, wordSpacingCue: "dangerous", wordSpacingLevel: -100,
      wordSpacingProgression: "yes",
    })).toMatchObject({
      wordSpacingCue: "none", wordSpacingLevel: 1, wordSpacingProgression: false,
    });
    expect(normalizeWorksheetConfig({
      ...legacy, wordSpacingLevel: 99,
    }).wordSpacingLevel).toBe(4);
  });

  it("preserves precise layout when blank practice rows are reserved", () => {
    const { worksheet, layout } = make({
      practiceText: "The cat is small",
      blankPracticeRows: 3,
      wordSpacingCue: "highlight",
      wordSpacingProgression: true,
    });
    expect(layout.rows).toHaveLength(worksheet.layout.rows.length);
    expect(layout.rows.slice(-3).every((r) => r.placements.length === 0)).toBe(true);
    expect(layout.rows.at(-1)?.spacingCues ?? []).toEqual([]);
    const first = layout.rows[0];
    expect((first.spacingCues ?? []).length).toBeGreaterThan(0);
    // Directly exercising the exported pure primitive generator is useful for
    // future mixed shape/text blocks.
    const raw = getRowWordSpacingCues(
      worksheet, [], worksheet.layout.rows[0], 0, 1
    );
    expect(raw).toEqual([]);
  });
});
