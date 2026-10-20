import { describe, it, expect } from "vitest";
import { calculateRowPositions } from "./calculateRowPositions";

describe("calculateRowPositions", () => {
  it("calculates the correct starting position for each row", () => {
    expect(calculateRowPositions(50, 300, 100)).toEqual([
      50,
      150,
      250,
    ]);
  });

  it("only creates positions for complete rows", () => {
    expect(calculateRowPositions(20, 250, 100)).toEqual([
      20,
      120,
    ]);
  });

  it("returns an empty array when no rows fit", () => {
    expect(calculateRowPositions(50, 50, 100)).toEqual([]);
  });
});

