/**
 * Color gradient definition for HSL colors
 */
export interface ColorGradient {
    start: number;     // Starting hue (0-360)
    end: number;       // Ending hue (0-360)
    inverted: boolean; // Invert the gradient direction
    S: number;         // Saturation (0-1)
    L: number;         // Lightness (0-1)
}

/**
 * Green to red gradient (for health bars, etc.)
 */
export const GreenToRed: ColorGradient = {
    start: 120,
    end: 0,
    inverted: true,
    S: 1,
    L: .5
};

/**
 * Get an HSL color string at a specific percentage along a gradient
 * @param gradient - The gradient definition
 * @param percent - Position along gradient (0-1)
 * @returns HSL color string like "hsl(120, 100%, 50%)"
 */
export function colorAtPercent(gradient: ColorGradient, percent: number): string {
    if (gradient.inverted) {
        percent = 1 - percent;
    }

    let H = (gradient.end - gradient.start) * percent + gradient.start;
    let S = gradient.S * 100;
    let L = gradient.L * 100;

    H = Math.floor(H);
    const SStr = Math.floor(S) + "%";
    const LStr = Math.floor(L) + "%";

    return "hsl(" + H + ", " + SStr + ", " + LStr + ")";
}
