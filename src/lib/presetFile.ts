import type { WorksheetConfig } from "../types/worksheet";
import { normalizeWorksheetConfig } from "./worksheetStorage";

export type PortablePreset = { name: string; config: WorksheetConfig };
const FORMAT = "linenook-worksheet-preset";
const VERSION = 1;

export function serializePresetFile(name: string, config: WorksheetConfig): string {
  return JSON.stringify({
    format: FORMAT,
    version: VERSION,
    name: name.trim().slice(0, 40) || "My worksheet",
    config: normalizeWorksheetConfig(config),
  }, null, 2);
}

export function parsePresetFile(text: string): PortablePreset {
  if (text.length > 120_000) {
    throw new Error("Preset file is too large.");
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(text) as unknown;
  } catch {
    throw new Error("This is not a valid JSON preset file.");
  }
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
    throw new Error("This is not a LineNook worksheet preset.");
  }
  const data = decoded as Record<string, unknown>;
  if (data.format !== FORMAT || data.version !== VERSION ||
      typeof data.name !== "string" ||
      !data.config || typeof data.config !== "object" || Array.isArray(data.config)) {
    throw new Error("This preset has an unsupported or invalid format.");
  }
  return {
    name: data.name.trim().slice(0, 40) || "Imported worksheet",
    config: normalizeWorksheetConfig(data.config),
  };
}

export function portablePresetFilename(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "").slice(0, 48);
  return "linenook-" + (slug || "worksheet") + "-preset.json";
}
