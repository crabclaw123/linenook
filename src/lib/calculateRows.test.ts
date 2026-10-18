import { describe, it, expect } from "vitest";
import { calculateRows } from "./calculateRows";

describe(" calculateRows", () => {
    it("calculates how many complete rows fit", () => {
        expect(calculateRows(600, 100)).toBe(6)
        expect(calculateRows(650, 100)).toBe(6)
        expect(calculateRows(450, 100)).toBe(4)
        expect(calculateRows(300, 50)).toBe(6)
    });
});


