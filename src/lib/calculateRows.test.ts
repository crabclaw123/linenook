import { describe, it, expect } from "vitest";
import { calculateRows } from "./calculateRows";

describe(" calculateRows", () => {
    it("calculates how many complete rows fit", () => {
        expect(calculateRows(600, 100)).toBe(6)
        expect(calculateRows(650, 100)).toBe(6)
        expect(calculateRows(450, 100)).toBe(4)
        expect(calculateRows(300, 50)).toBe(6)
    });

    it("returns zero when no usable height is available", () => {
    expect(calculateRows(0, 100)).toBe(0);
    expect(calculateRows(-50, 100)).toBe(0);
    });

    it("throws an error for invalid row heights", () => {
    expect(() => calculateRows(600, 0)).toThrow();
    expect(() => calculateRows(600, -100)).toThrow();
    });

    it("throws an error for non-finite dimensions", () => {
    expect(() => calculateRows(Infinity, 100)).toThrow();
    expect(() => calculateRows(600, NaN)).toThrow();
    });
});


