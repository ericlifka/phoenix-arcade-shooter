import Sprite from '../core/sprite.js';

const n = null;
const w = 'white';

/** White-ember branding — matches the player ship palette. */
const TIP = '#ffffff';
const HIGHLIGHT = '#fff0e0';
const BODY = '#ffd0a8';
const WING = '#e87848';
const EDGE = '#a84028';

type Cell = string | null;

/**
 * Shade a filled glyph: hot white interior near the top of the source mask,
 * ember outline, deeper red on the trailing edge. Applied before invertY/rotateRight.
 */
function shadeGlyph(mask: Cell[][]): Cell[][] {
    const width = mask.length;
    const height = mask[0].length;
    const out: Cell[][] = mask.map((col) => col.slice());

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (!mask[x][y]) continue;

            const isEdge = !(mask[x - 1]?.[y] && mask[x + 1]?.[y] && mask[x][y - 1] && mask[x][y + 1]);
            const t = height <= 1 ? 0 : y / (height - 1);

            if (isEdge) {
                out[x][y] = t > 0.65 ? EDGE : WING;
            } else if (t < 0.3) {
                out[x][y] = TIP;
            } else if (t < 0.6) {
                out[x][y] = HIGHLIGHT;
            } else {
                out[x][y] = BODY;
            }
        }
    }

    return out;
}

function letter(mask: Cell[][]): Sprite {
    return new Sprite(shadeGlyph(mask)).invertY().rotateRight();
}

export default {
    meta: {
        width: 15,
        height: 15,
        lineHeight: 16,
        letterSpacing: -1
    },
    P: letter([
        [n, n, n, w, w, w, w, w, w, w, w, w, n, n],
        [n, n, n, n, n, w, w, w, n, n, w, w, w, n],
        [n, n, n, n, n, w, w, n, n, n, n, w, w, w],
        [n, n, n, n, w, w, n, n, n, n, n, n, w, w],
        [n, n, n, n, w, w, n, n, n, n, n, n, w, w],
        [n, n, n, n, w, w, n, n, n, n, n, n, w, w],
        [n, n, n, n, w, w, w, n, n, n, n, w, w, w],
        [n, n, n, w, w, w, w, w, n, n, w, w, w, n],
        [n, n, n, w, w, n, w, w, w, w, w, w, n, n],
        [n, n, n, w, w, n, n, n, n, n, n, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, n, n, n, n],
        [w, w, w, w, w, w, n, n, n, n, n, n, n, n]
    ]),
    H: letter([
        [n, n, n, w, w, w, w, w, w, n, n, w, w, w, w, w, w],
        [n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n],
        [n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n],
        [n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n],
        [n, n, n, w, w, w, w, w, w, w, w, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n],
        [w, w, w, w, w, w, n, n, w, w, w, w, w, w, n, n, n]
    ]),
    O: letter([
        [n, n, n, n, n, w, w, w, w, w, n, n],
        [n, n, n, n, w, w, w, n, w, w, w, n],
        [n, n, n, w, w, w, n, n, n, w, w, n],
        [n, n, n, w, w, n, n, n, n, w, w, w],
        [n, n, w, w, n, n, n, n, n, n, w, w],
        [n, n, w, w, n, n, n, n, n, n, w, w],
        [n, w, w, n, n, n, n, n, n, n, w, w],
        [n, w, w, n, n, n, n, n, n, n, w, w],
        [n, w, w, n, n, n, n, n, n, w, w, n],
        [w, w, n, n, n, n, n, n, n, w, w, n],
        [w, w, n, n, n, n, n, n, n, w, w, n],
        [w, w, n, n, n, n, n, n, w, w, n, n],
        [n, w, w, n, n, n, n, w, w, n, n, n],
        [n, n, w, w, n, n, w, w, n, n, n, n],
        [n, n, n, w, w, w, w, n, n, n, n, n]
    ]),
    E: letter([
        [n, n, n, w, w, w, w, w, w, w, w, w, w, w],
        [n, n, n, n, n, w, w, n, n, n, n, n, n, w],
        [n, n, n, n, n, w, w, n, n, n, n, n, n, n],
        [n, n, n, n, w, w, n, n, n, n, n, n, n, n],
        [n, n, n, n, w, w, n, n, n, n, n, n, n, n],
        [n, n, n, n, w, w, n, n, n, n, n, n, n, n],
        [n, n, n, n, w, w, n, n, n, n, w, n, n, n],
        [n, n, n, w, w, w, w, w, w, w, w, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, w, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, n, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, n, w, n, n],
        [w, w, w, w, w, w, w, w, w, w, w, w, n, n]
    ]),
    N: letter([
        [n, n, n, w, w, w, w, n, n, n, n, w, w, w, w, w, w],
        [n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n],
        [n, n, n, n, n, w, w, w, n, n, n, n, n, w, w, n, n],
        [n, n, n, n, w, w, w, w, n, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, w, w, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, w, w, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, w, w, n, n, n, w, w, n, n, n],
        [n, n, n, w, w, n, n, n, w, w, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, w, w, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, w, w, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, n, w, w, w, w, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, w, w, w, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n],
        [w, w, w, w, w, w, n, n, n, n, w, w, w, w, n, n, n]
    ]),
    I: letter([
        [n, n, n, w, w, w, w, w, w],
        [n, n, n, n, n, w, w, n, n],
        [n, n, n, n, n, w, w, n, n],
        [n, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, n, n],
        [n, n, n, n, w, w, n, n, n],
        [n, n, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, n],
        [n, n, n, w, w, n, n, n, n],
        [n, n, w, w, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n],
        [w, w, w, w, w, w, n, n, n]
    ]),
    X: letter([
        [n, n, n, w, w, w, w, w, w, n, n, w, w, w, w, w, w],
        [n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n],
        [n, n, n, n, n, w, w, n, n, n, n, n, w, w, n, n, n],
        [n, n, n, n, n, n, w, w, n, n, n, w, w, n, n, n, n],
        [n, n, n, n, n, n, w, w, n, n, w, w, n, n, n, n, n],
        [n, n, n, n, n, n, n, w, w, w, w, n, n, n, n, n, n],
        [n, n, n, n, n, n, n, w, w, w, n, n, n, n, n, n, n],
        [n, n, n, n, n, n, n, w, w, w, n, n, n, n, n, n, n],
        [n, n, n, n, n, n, n, w, w, w, n, n, n, n, n, n, n],
        [n, n, n, n, n, n, w, w, w, w, n, n, n, n, n, n, n],
        [n, n, n, n, n, w, w, n, n, w, w, n, n, n, n, n, n],
        [n, n, n, n, w, w, n, n, n, w, w, n, n, n, n, n, n],
        [n, n, n, w, w, n, n, n, n, n, w, w, n, n, n, n, n],
        [n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n],
        [w, w, w, w, w, w, n, n, w, w, w, w, w, w, n, n, n]
    ])
};
