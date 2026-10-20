export type Guidelines = {
    top: number;
    middle: number;
    baseline: number;
};

export function calculateGuidelines(
    startY: number,
    writingHeight: number
): Guidelines {
    return {
        top: startY,
        middle: startY + writingHeight / 2,
        baseline: startY + writingHeight,
    };
}