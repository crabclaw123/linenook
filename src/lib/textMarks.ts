import type { HighlightTone, PracticeMode, TextMark } from "../types/worksheet";

export type StyleEdit = {
  mode?: PracticeMode | null;
  highlight?: HighlightTone | null;
};

const MODES: readonly PracticeMode[] = ["trace", "copy", "fade", "blank"];
const COLORS: readonly HighlightTone[] = ["yellow", "mint", "peach"];

function hasStyle(mark: Partial<TextMark>): boolean {
  return mark.mode !== undefined || mark.highlight !== undefined;
}

/** Convert untrusted or overlapping serialized marks into non-overlapping ranges. */
export function sanitizeTextMarks(value: unknown, length: number): TextMark[] {
  if (!Array.isArray(value)) return [];
  const max = Math.max(0, Math.min(120, length));
  const marks: TextMark[] = [];
  for (const entry of value.slice(0, 120)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const item = entry as Record<string, unknown>;
    if (typeof item.start !== "number" || !Number.isFinite(item.start) ||
        typeof item.end !== "number" || !Number.isFinite(item.end)) continue;
    const start = Math.max(0, Math.min(max, Math.floor(item.start)));
    const end = Math.max(start, Math.min(max, Math.floor(item.end)));
    if (end <= start) continue;
    const mode = MODES.find((m) => m === item.mode);
    const highlight = COLORS.find((c) => c === item.highlight);
    if (mode === undefined && highlight === undefined) continue;
    // Later imported entries override the corresponding previous properties.
    marks.splice(0, marks.length, ...applyTextStyle(marks, max, start, end, {
      ...(mode ? { mode } : {}),
      ...(highlight ? { highlight } : {}),
    }));
  }
  return marks;
}

export function textStyleAt(marks: readonly TextMark[], index: number):
  Pick<TextMark, "mode" | "highlight"> {
  return marks.find((mark) => index >= mark.start && index < mark.end) ?? {};
}

/**
 * Edit only the requested property over the selected character range.
 * Merging adjacent equal styles keeps saved presets compact and predictable.
 */
export function applyTextStyle(
  marks: readonly TextMark[],
  length: number,
  from: number,
  to: number,
  edit: StyleEdit
): TextMark[] {
  const n = Math.max(0, Math.floor(length));
  const start = Math.max(0, Math.min(n, Math.floor(from)));
  const end = Math.max(start, Math.min(n, Math.floor(to)));
  if (start === end) return [...marks];
  const perCharacter = Array.from({ length: n }, (_, i) => {
    const old = textStyleAt(marks, i);
    if (i < start || i >= end) return { mode: old.mode, highlight: old.highlight };
    return {
      mode: edit.mode === undefined ? old.mode : edit.mode ?? undefined,
      highlight: edit.highlight === undefined ? old.highlight : edit.highlight ?? undefined,
    };
  });
  const result: TextMark[] = [];
  perCharacter.forEach((style, i) => {
    if (!hasStyle(style)) return;
    const last = result[result.length - 1];
    if (last && last.end === i && last.mode === style.mode &&
        last.highlight === style.highlight) {
      last.end = i + 1;
    } else {
      result.push({ start: i, end: i + 1, ...style });
    }
  });
  return result;
}

export const HIGHLIGHT_COLORS: Record<HighlightTone, string> = {
  yellow: "#fff0a7",
  mint: "#d8f2dd",
  peach: "#ffe0c5",
};

/**
 * Do not silently attach styling to the wrong word after an edit.
 * Retain untouched prefixes/suffixes and shift suffix offsets; discard marks
 * intersecting the edited region. Replacement at an interior boundary of a
 * mark drops that mark rather than styling newly typed characters.
 */
export function rebaseTextMarks(
  marks: readonly TextMark[], before: string, after: string
): TextMark[] {
  if (before === after) return [...marks];
  let prefix = 0;
  while (prefix < before.length && prefix < after.length &&
    before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  const changedEnd = before.length - suffix;
  const delta = after.length - before.length;
  return marks.flatMap((mark): TextMark[] => {
    if (mark.end <= prefix) return [{ ...mark }];
    if (mark.start >= changedEnd) {
      return [{ ...mark, start: mark.start + delta, end: mark.end + delta }];
    }
    return [];
  });
}
