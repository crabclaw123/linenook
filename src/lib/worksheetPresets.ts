export type WorksheetPreset = {
  id: string;
  label: string;
  title: string;
  practiceText: string;
};

export const WORKSHEET_PRESETS: readonly WorksheetPreset[] = [
  {
    id: "name",
    label: "My name",
    title: "My Name Practice",
    practiceText: "My name",
  },
  {
    id: "letters",
    label: "Letters",
    title: "Alphabet Practice",
    practiceText: "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj",
  },
  {
    id: "numbers",
    label: "Numbers",
    title: "Number Practice",
    practiceText: "1 2 3 4 5 6 7 8 9 0",
  },
  {
    id: "sentence",
    label: "Sentence",
    title: "Sentence Practice",
    practiceText: "The quick brown fox jumps over the lazy dog.",
  },
  {
    id: "greeting",
    label: "Hello!",
    title: "My Handwriting Practice",
    practiceText: "Hello",
  },
];
