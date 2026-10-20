/**
 * LineNook's original single-stroke handwriting alphabet.
 * Coordinates are in a 10-unit top-to-baseline em; lowercase x-height is 5.
 * Paths use absolute SVG M/L/Q/C commands, shared by the SVG and PDF renderers.
 * This is a teaching aid, not a certified handwriting curriculum font.
 */
export type HandwritingGlyph = {
  width: number;
  strokes: readonly string[];
};

function glyph(width: number, ...strokes: string[]): HandwritingGlyph {
  return { width, strokes };
}

export const LETTER_SPACING = 1.25;

export const HANDWRITING_GLYPHS: Readonly<Record<string, HandwritingGlyph>> = {
  " ": glyph(4),
  A: glyph(8, "M .5 10 L 4 0 L 7.5 10", "M 1.8 6.5 L 6.2 6.5"),
  B: glyph(8, "M 1 10 L 1 0 L 4.3 0 C 8.5 0 8.5 4.6 4.3 5 L 1 5", "M 4.3 5 C 9 5 9 10 4.3 10 L 1 10"),
  C: glyph(8, "M 7.1 1.4 C 5.3 -.8 1 0 1 5 C 1 10 5.4 11 7.1 8.7"),
  D: glyph(8.5, "M 1 0 L 1 10 L 3.5 10 C 10 10 10 0 3.5 0 L 1 0"),
  E: glyph(7.5, "M 7 0 L 1 0 L 1 10 L 7 10", "M 1 5 L 6 5"),
  F: glyph(7.5, "M 1 10 L 1 0 L 7 0", "M 1 5 L 6 5"),
  G: glyph(8.6, "M 7.3 1.5 C 5.3 -.8 1 0 1 5 C 1 10 6 11 7.5 8 L 7.5 5.5 L 4.8 5.5"),
  H: glyph(8.6, "M 1 0 L 1 10", "M 7.5 0 L 7.5 10", "M 1 5 L 7.5 5"),
  I: glyph(4.8, "M .8 0 L 4 0", "M 2.4 0 L 2.4 10", "M .8 10 L 4 10"),
  J: glyph(7.5, "M 6 0 L 6 7.5 C 6 11 1 11 1 8"),
  K: glyph(8.5, "M 1 0 L 1 10", "M 7.5 0 L 1 6", "M 3.8 3.6 L 7.6 10"),
  L: glyph(7, "M 1 0 L 1 10 L 6.5 10"),
  M: glyph(10.5, "M 1 10 L 1 0 L 5.2 5.8 L 9.3 0 L 9.3 10"),
  N: glyph(9, "M 1 10 L 1 0 L 8 10 L 8 0"),
  O: glyph(9, "M 8 5 C 8 11 1 11 1 5 C 1 -1 8 -1 8 5"),
  P: glyph(8, "M 1 10 L 1 0 L 4.1 0 C 8.4 0 8.4 5.2 4.1 5.2 L 1 5.2"),
  Q: glyph(9, "M 8 5 C 8 11 1 11 1 5 C 1 -1 8 -1 8 5", "M 5.3 7.4 L 8.5 10.8"),
  R: glyph(8.5, "M 1 10 L 1 0 L 4.2 0 C 8.5 0 8.5 5.1 4.2 5.1 L 1 5.1", "M 4 5.1 L 7.7 10"),
  S: glyph(8, "M 7 1.3 C 5 -1 1 .1 1 2.7 C 1 5.1 7 4.5 7 7.3 C 7 11 2.6 11 1 8.8"),
  T: glyph(8, "M .5 0 L 7.5 0", "M 4 0 L 4 10"),
  U: glyph(9, "M 1 0 L 1 6.8 C 1 11 8 11 8 6.8 L 8 0"),
  V: glyph(8, "M .5 0 L 4 10 L 7.5 0"),
  W: glyph(11, "M .5 0 L 2.7 10 L 5.4 4 L 8.1 10 L 10.5 0"),
  X: glyph(8, "M .7 0 L 7.3 10", "M 7.3 0 L .7 10"),
  Y: glyph(8, "M .5 0 L 4 5 L 7.5 0", "M 4 5 L 4 10"),
  Z: glyph(8, "M 1 0 L 7 0 L 1 10 L 7 10"),

  a: glyph(7.4, "M 6.2 7.5 C 6.2 4 1 3.8 1 7.5 C 1 11.1 6.2 11 6.2 7.5", "M 6.2 5 L 6.2 10"),
  b: glyph(7.5, "M 1 0 L 1 10", "M 1 7.5 C 1 4 6.6 3.6 6.6 7.5 C 6.6 11 1 11 1 7.5"),
  c: glyph(7, "M 6 5.8 C 4.2 4 1 5 1 7.5 C 1 10.2 4.2 11.1 6 9.2"),
  d: glyph(7.5, "M 6.5 0 L 6.5 10", "M 6.5 7.5 C 6.5 4 1 3.6 1 7.5 C 1 11 6.5 11 6.5 7.5"),
  e: glyph(7.1, "M 1 7.5 L 6.2 7.5 C 6.2 4 1 4 1 7.5 C 1 10.3 4.2 11 6.2 9.4"),
  f: glyph(5.5, "M 4.9 1 C 2.4 -.2 2 2 2 4.4 L 2 10", "M .7 5 L 4.6 5"),
  g: glyph(7.5, "M 6.4 7.5 C 6.4 4 1 3.8 1 7.5 C 1 11 6.4 11 6.4 7.5", "M 6.4 5 L 6.4 10.5 C 6.4 14.3 2.5 14 1.4 12.3"),
  h: glyph(7.6, "M 1 0 L 1 10", "M 1 7.5 C 1 3.8 6.5 3.8 6.5 7.5 L 6.5 10"),
  i: glyph(3.6, "M 1.8 5 L 1.8 10", "M 1.8 2.6 L 1.8 2.85"),
  j: glyph(4.3, "M 2.8 5 L 2.8 11.5 C 2.8 13.7 1 13.7 .6 12.4", "M 2.8 2.6 L 2.8 2.85"),
  k: glyph(7.1, "M 1 0 L 1 10", "M 6.2 5 L 1 8", "M 3.4 6.7 L 6.4 10"),
  l: glyph(3.7, "M 1.8 0 L 1.8 10"),
  m: glyph(10.4, "M 1 5 L 1 10", "M 1 7.2 C 1 4 5.1 4 5.1 7.2 L 5.1 10", "M 5.1 7.2 C 5.1 4 9.4 4 9.4 7.2 L 9.4 10"),
  n: glyph(7.6, "M 1 5 L 1 10", "M 1 7.3 C 1 4 6.5 4 6.5 7.3 L 6.5 10"),
  o: glyph(7.3, "M 6.3 7.5 C 6.3 11.2 1 11.2 1 7.5 C 1 3.8 6.3 3.8 6.3 7.5"),
  p: glyph(7.5, "M 1 5 L 1 13", "M 1 7.5 C 1 4 6.5 3.9 6.5 7.5 C 6.5 11 1 11 1 7.5"),
  q: glyph(7.5, "M 6.4 7.5 C 6.4 4 1 3.8 1 7.5 C 1 11 6.4 11 6.4 7.5", "M 6.4 5 L 6.4 13"),
  r: glyph(5.6, "M 1 5 L 1 10", "M 1 7.5 C 1 5.5 2.7 4.5 4.8 5"),
  s: glyph(6.6, "M 5.5 5.7 C 3.4 4 1 5.1 1 6.4 C 1 8 5.5 7.4 5.5 9 C 5.5 11 2 11 1 9.8"),
  t: glyph(5.5, "M 2.6 2 L 2.6 8 C 2.6 10 3.2 10.5 4.8 10", "M .7 5 L 4.6 5"),
  u: glyph(7.5, "M 1 5 L 1 8 C 1 11.4 6.5 11.4 6.5 8 L 6.5 5 L 6.5 10"),
  v: glyph(7.2, "M .7 5 L 3.6 10 L 6.5 5"),
  w: glyph(10, "M .5 5 L 2.7 10 L 5 6.2 L 7.3 10 L 9.5 5"),
  x: glyph(7, "M .7 5 L 6.3 10", "M 6.3 5 L .7 10"),
  y: glyph(7.5, "M .7 5 L 3.7 10 L 6.6 5 L 3.1 12.5 C 2.5 13.7 1.4 13.7 .9 13"),
  z: glyph(6.8, "M 1 5 L 5.9 5 L 1 10 L 5.9 10"),

  "0": glyph(8, "M 7 5 C 7 11 1 11 1 5 C 1 -1 7 -1 7 5"),
  "1": glyph(5.8, "M 1 2 L 3.2 0 L 3.2 10", "M 1 10 L 5 10"),
  "2": glyph(8, "M 1 2.3 C 1 -.8 7 -.8 7 2.6 C 7 4.7 1.1 8 1.1 10 L 7.2 10"),
  "3": glyph(8, "M 1 1.6 C 3 -.8 7 -.3 7 2.8 C 7 4.4 5.8 5 4 5", "M 4 5 C 8.8 4.5 8.6 11 4.2 10.4 C 2.6 10.4 1.6 9.8 1 8.5"),
  "4": glyph(8, "M 6.4 10 L 6.4 0 L .7 6.7 L 7.4 6.7"),
  "5": glyph(8, "M 7 0 L 1.4 0 L 1.2 4.9 C 7.9 2.3 8.7 10 4.1 10.4 C 2.5 10.4 1.6 9.9 1 9"),
  "6": glyph(8, "M 6.5 .7 C 2 -1 1 4 1 7 C 1 11.4 7.2 11.4 7.2 7.7 C 7.2 4.4 2.7 4 1.1 7"),
  "7": glyph(8, "M .8 0 L 7.2 0 L 2.5 10"),
  "8": glyph(8, "M 4 5 C .2 5 .4 0 4 0 C 7.6 0 7.8 5 4 5 C -.5 5 -.2 10.5 4 10.5 C 8.2 10.5 8.5 5 4 5"),
  "9": glyph(8, "M 6.8 5 C 5.2 8 1 7 1 3.7 C 1 .1 7 .1 7 4 C 7 7 6 11 1.7 10"),

  ".": glyph(3, "M 1.5 9.7 L 1.51 9.8"),
  ",": glyph(3, "M 1.8 9.4 L 1.1 11.5"),
  "!": glyph(3.5, "M 1.8 0 L 1.8 7.2", "M 1.8 9.6 L 1.81 9.7"),
  "?": glyph(7, "M 1 2 C 1 -.8 6 -.7 6 2.6 C 6 4.6 3.2 4.6 3.2 7", "M 3.2 9.6 L 3.21 9.7"),
  "'": glyph(3, "M 1.8 0 L 1.2 2.4"),
  '"': glyph(5.2, "M 1.6 0 L 1.1 2.4", "M 4.2 0 L 3.7 2.4"),
  "-": glyph(5.5, "M .7 6.5 L 4.8 6.5"),
  ":": glyph(3, "M 1.5 5.3 L 1.51 5.4", "M 1.5 9.6 L 1.51 9.7"),
  ";": glyph(3, "M 1.5 5.3 L 1.51 5.4", "M 1.8 9.4 L 1.1 11.5"),
  "/": glyph(6, "M .5 10 L 5.5 0"),
  "(": glyph(4.4, "M 3.8 0 C .1 2.8 .1 8 3.8 11"),
  ")": glyph(4.4, "M .6 0 C 4.3 2.8 4.3 8 .6 11"),
  "+": glyph(7, "M 3.5 3 L 3.5 9", "M .5 6 L 6.5 6"),
  "&": glyph(9, "M 7.6 9.8 C 3 11 1 7.8 1 6.1 C 1 4.4 6.3 3.6 6.3 1.8 C 6.3 -.9 2 -.8 2 2.2 C 2 4.5 7.4 8.4 8 10"),
};

export function getHandwritingGlyph(character: string): HandwritingGlyph {
  return HANDWRITING_GLYPHS[character] ?? HANDWRITING_GLYPHS["?"];
}

export function isHandwritingCharacterSupported(character: string): boolean {
  return Object.prototype.hasOwnProperty.call(HANDWRITING_GLYPHS, character);
}
