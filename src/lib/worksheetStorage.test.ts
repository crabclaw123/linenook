import { describe, expect, it } from "vitest";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import {
  CURRENT_CONFIG_KEY,
  SAVED_PRESETS_KEY,
  loadCurrentConfig,
  loadSavedPresets,
  normalizeWorksheetConfig,
  persistCurrentConfig,
  persistSavedPresets,
} from "./worksheetStorage";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    data,
  };
}

describe("browser-local worksheet settings and named presets", () => {
  it("restores the current worksheet without a backend", () => {
    const storage = memoryStore();
    const config = { ...defaultWorksheetConfig, practiceText: "Occupational therapy",
      showName: true, paperSize: "a4" as const };
    expect(persistCurrentConfig(config, storage)).toBe(true);
    expect(loadCurrentConfig(storage)).toMatchObject(config);
  });

  it("restores safely from corrupted or outdated data", () => {
    const storage = memoryStore();
    storage.setItem(CURRENT_CONFIG_KEY, "{");
    expect(loadCurrentConfig(storage)).toEqual(defaultWorksheetConfig);
    storage.setItem(CURRENT_CONFIG_KEY, JSON.stringify({
      ...defaultWorksheetConfig,
      paperSize: "legal", practiceMode: "unknown", writingHeight: 24,
      rowHeight: 24, margin: 999, titleHeight: -100,
    }));
    const restored = loadCurrentConfig(storage);
    expect(restored.paperSize).toBe("letter");
    expect(restored.practiceMode).toBe("trace");
    expect(restored.rowHeight - restored.writingHeight).toBeGreaterThanOrEqual(13);
    expect(restored.margin).toBe(25);
    expect(restored.titleHeight).toBe(defaultWorksheetConfig.titleHeight);
    expect(normalizeWorksheetConfig(null)).toEqual(defaultWorksheetConfig);
  });

  it("saves and loads named worksheet presets", () => {
    const storage = memoryStore();
    const presets = [{
      id: "my-test",
      name: " Grade 2 ",
      savedAt: "2026-10-20",
      config: { ...defaultWorksheetConfig, lineStyle: "color-cues" as const },
    }];
    expect(persistSavedPresets(presets, storage)).toBe(true);
    const loaded = loadSavedPresets(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe("Grade 2");
    expect(loaded[0].config.lineStyle).toBe("color-cues");
    storage.setItem(SAVED_PRESETS_KEY, "not-json");
    expect(loadSavedPresets(storage)).toEqual([]);
  });

  it("avoids crashing when storage is blocked", () => {
    const blocked = {
      getItem(): string | null { throw new Error("blocked"); },
      setItem(): void { throw new Error("blocked"); },
    };
    expect(loadCurrentConfig(blocked)).toEqual(defaultWorksheetConfig);
    expect(loadSavedPresets(blocked)).toEqual([]);
    expect(persistCurrentConfig(defaultWorksheetConfig, blocked)).toBe(false);
    expect(persistSavedPresets([], blocked)).toBe(false);
  });
});
