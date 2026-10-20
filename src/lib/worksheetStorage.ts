import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { minimumRowGap } from "./worksheetSizing";
import type { WorksheetConfig } from "../types/worksheet";

export const CURRENT_CONFIG_KEY = "linenook:worksheet:config:v2";
export const SAVED_PRESETS_KEY = "linenook:worksheet:presets:v2";

export type SavedWorksheetPreset = {
  id: string;
  name: string;
  savedAt: string;
  config: WorksheetConfig;
};

type Store = Pick<Storage, "getItem" | "setItem">;

function currentStore(): Store | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function select<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.some((option) => option === value)
    ? value as T
    : fallback;
}

function finiteInRange(value: unknown, fallback: number, low: number, high: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(high, Math.max(low, value)) : fallback;
}

function safeText(value: unknown, fallback: string, maxLength: number): string {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}

/** Never trust serialized browser state as a complete, valid WorksheetConfig. */
export function normalizeWorksheetConfig(data: unknown): WorksheetConfig {
  const saved = record(data);
  const defaults = defaultWorksheetConfig;
  const writingHeight = finiteInRange(saved.writingHeight, defaults.writingHeight, 8, 24);
  const originalGap = typeof saved.rowHeight === "number"
    ? saved.rowHeight - writingHeight : defaults.rowHeight - defaults.writingHeight;
  const safeGap = finiteInRange(originalGap, defaults.rowHeight - defaults.writingHeight,
    minimumRowGap(writingHeight), 22);
  return {
    title: safeText(saved.title, defaults.title, 70),
    practiceText: safeText(saved.practiceText, defaults.practiceText, 120),
    paperSize: select(saved.paperSize, ["letter", "a4"], defaults.paperSize),
    margin: finiteInRange(saved.margin, defaults.margin, 8, 25),
    titleHeight: defaults.titleHeight,
    writingHeight,
    rowHeight: writingHeight + safeGap,
    fillPage: typeof saved.fillPage === "boolean" ? saved.fillPage : defaults.fillPage,
    highlightBaseline: typeof saved.highlightBaseline === "boolean"
      ? saved.highlightBaseline : defaults.highlightBaseline,
    showTrace: typeof saved.showTrace === "boolean" ? saved.showTrace : defaults.showTrace,
    lineStyle: select(saved.lineStyle,
      ["classic", "color-cues", "double", "baseline"], defaults.lineStyle),
    letterCase: select(saved.letterCase,
      ["as-typed", "uppercase", "lowercase"], defaults.letterCase),
    letterForm: select(saved.letterForm, ["simple", "rounded"], defaults.letterForm),
    promptStyle: select(saved.promptStyle,
      ["whole", "letter-by-letter"], defaults.promptStyle),
    practiceMode: select(saved.practiceMode,
      ["trace", "copy", "fade", "blank"], defaults.practiceMode),
    writingHand: select(saved.writingHand, ["right", "left"], defaults.writingHand),
    showName: typeof saved.showName === "boolean" ? saved.showName : defaults.showName,
    showDate: typeof saved.showDate === "boolean" ? saved.showDate : defaults.showDate,
  };
}

export function loadCurrentConfig(storage: Store | null = currentStore()): WorksheetConfig {
  try {
    const raw = storage?.getItem(CURRENT_CONFIG_KEY);
    return raw ? normalizeWorksheetConfig(JSON.parse(raw) as unknown)
      : { ...defaultWorksheetConfig };
  } catch {
    return { ...defaultWorksheetConfig };
  }
}

export function persistCurrentConfig(
  config: WorksheetConfig,
  storage: Store | null = currentStore()
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(CURRENT_CONFIG_KEY, JSON.stringify(normalizeWorksheetConfig(config)));
    return true;
  } catch {
    return false;
  }
}

export function loadSavedPresets(storage: Store | null = currentStore()): SavedWorksheetPreset[] {
  try {
    const raw = storage?.getItem(SAVED_PRESETS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 20).flatMap((value: unknown): SavedWorksheetPreset[] => {
      const saved = record(value);
      if (typeof saved.name !== "string" || !saved.name.trim() ||
          typeof saved.id !== "string" || !saved.id ||
          typeof saved.savedAt !== "string") return [];
      return [{
        id: saved.id.slice(0, 100),
        name: saved.name.trim().slice(0, 40),
        savedAt: saved.savedAt,
        config: normalizeWorksheetConfig(saved.config),
      }];
    });
  } catch {
    return [];
  }
}

export function persistSavedPresets(
  presets: readonly SavedWorksheetPreset[],
  storage: Store | null = currentStore()
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(SAVED_PRESETS_KEY, JSON.stringify(presets.slice(0, 20)));
    return true;
  } catch {
    return false;
  }
}
