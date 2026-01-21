export const GreenToRed = {
    start: 120,
    end: 0,
    inverted: true,
    S: 1,
    L: .5
};

export function colorAtPercent(gradient, percent) {
    if (gradient.inverted) {
        percent = 1 - percent;
    }

    let H = (gradient.end - gradient.start) * percent + gradient.start;
    let S = gradient.S * 100;
    let L = gradient.L * 100;

    H = Math.floor(H);
    S = Math.floor(S) + "%";
    L = Math.floor(L) + "%";

    return "hsl(" + H + ", " + S + ", " + L + ")";
}
