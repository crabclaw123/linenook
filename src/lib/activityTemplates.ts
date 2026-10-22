import type { WorksheetConfig } from "../types/worksheet";

export type ActivityCategory = "Names & sentences" | "Letter skills" |
  "Themed writing" | "Prewriting shapes";
export type ActivityTemplate = {
  id: string;
  label: string;
  description: string;
  category: ActivityCategory;
  config: Partial<WorksheetConfig>;
};

/** Edit the example text and formatting freely after choosing a template. */
export const ACTIVITY_TEMPLATES: readonly ActivityTemplate[] = [
  { id: "my-name", label: "Write my name", description: "Personalize the model",
    category: "Names & sentences", config: {
      activityType: "text", title: "My Name Practice",
      practiceText: "My name is Cam", showName: true, practiceMode: "trace",
    } },
  { id: "copy-sentence", label: "Copy a sentence", description: "One solid model, then independent writing",
    category: "Names & sentences", config: {
      activityType: "text", title: "Copy the Sentence",
      practiceText: "I can write neatly.", practiceMode: "copy",
    } },
  { id: "fade-sentence", label: "Fade a sentence", description: "Reduce visual cues between repetitions",
    category: "Names & sentences", config: {
      activityType: "text", title: "Getting More Independent",
      practiceText: "I can do it!", practiceMode: "fade", blankPracticeRows: 2,
    } },
  { id: "vowels", label: "Vowel practice", description: "a e i o u",
    category: "Letter skills", config: {
      activityType: "text", title: "Vowel Formation",
      practiceText: "a e i o u", promptStyle: "letter-by-letter",
      practiceMode: "trace",
    } },
  { id: "tall-letters", label: "Tall letters", description: "Ascenders: b, d, f, h, k, l, t",
    category: "Letter skills", config: {
      activityType: "text", title: "Tall Letter Practice",
      practiceText: "b d f h k l t", promptStyle: "letter-by-letter",
      practiceMode: "trace",
    } },
  { id: "tail-letters", label: "Tail letters", description: "Descenders: g, j, p, q, y",
    category: "Letter skills", config: {
      activityType: "text", title: "Letters with Tails",
      practiceText: "g j p q y", promptStyle: "letter-by-letter",
      practiceMode: "trace",
    } },
  { id: "upper-lower", label: "Alphabet pairs", description: "Uppercase/lowercase pairs",
    category: "Letter skills", config: {
      activityType: "text", title: "Alphabet Pairs",
      practiceText: "Aa Bb Cc Dd Ee Ff", promptStyle: "whole",
      practiceMode: "trace",
    } },
  { id: "ocean", label: "Ocean animals", description: "Sentence-copying theme",
    category: "Themed writing", config: {
      activityType: "text", title: "Ocean Explorers",
      practiceText: "The turtle swims in the sea.", practiceMode: "copy",
      promptStyle: "whole",
    } },
  { id: "space", label: "Outer space", description: "Trace a fun science sentence",
    category: "Themed writing", config: {
      activityType: "text", title: "Space Adventure",
      practiceText: "The rocket flies to the moon.", practiceMode: "trace",
      promptStyle: "whole",
    } },
  { id: "garden", label: "Garden friends", description: "Trace or copy a nature sentence",
    category: "Themed writing", config: {
      activityType: "text", title: "Garden Friends",
      practiceText: "The bees visit the flowers.", practiceMode: "trace",
      promptStyle: "whole",
    } },
  { id: "shape-circles", label: "Circles", description: "Curved-line prewriting practice",
    category: "Prewriting shapes", config: {
      activityType: "shapes", shapeId: "circle", title: "Circle Practice",
      practiceMode: "trace", lineStyle: "double",
    } },
  { id: "shape-zigzags", label: "Zigzags", description: "Practice changing stroke directions",
    category: "Prewriting shapes", config: {
      activityType: "shapes", shapeId: "zigzag", title: "Zigzag Practice",
      practiceMode: "trace", lineStyle: "double",
    } },
  { id: "shape-spirals", label: "Spirals", description: "Continuous curves and control",
    category: "Prewriting shapes", config: {
      activityType: "shapes", shapeId: "spiral", title: "Spiral Practice",
      practiceMode: "fade", lineStyle: "double",
    } },
];

export const ACTIVITY_CATEGORIES: readonly ActivityCategory[] = [
  "Names & sentences", "Letter skills", "Themed writing", "Prewriting shapes",
];

/** New activity text must never inherit styles from an unrelated phrase. */
export function applyActivityTemplate(
  config: WorksheetConfig, template: ActivityTemplate
): WorksheetConfig {
  return {
    ...config,
    ...template.config,
    textMarks: [],
    showTrace: template.config.practiceMode !== "blank",
  };
}
