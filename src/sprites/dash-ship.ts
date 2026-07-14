import Sprite from '../rendering/core/sprite.js';

/**
 * Dash scout — wide, angular interceptor (distinct from the vertical arrow ships).
 * Accent cyan so it reads as a different faction/behavior on screen.
 */
export default function dashShipSprite(): Sprite {
    const c1 = '#88eeff';
    const c2 = '#44aacc';
    const c3 = '#226688';
    const w1 = '#eeeeee';
    const g1 = '#999999';
    const nn = null;

    // Columns are X; each array is top→bottom along Y.
    // Shape: stubby horizontal chevron pointing down-ish / "skimmer".
    return new Sprite([
        [nn, nn, c3, c2, c1, c2, c3, nn, nn],
        [nn, c3, c2, w1, w1, w1, c2, c3, nn],
        [c3, c2, g1, c1, w1, c1, g1, c2, c3],
        [nn, c3, nn, c2, c1, c2, nn, c3, nn],
        [nn, nn, nn, nn, c2, nn, nn, nn, nn],
        [nn, nn, nn, nn, c3, nn, nn, nn, nn]
    ], {
        guns: [{ x: 4, y: 5 }]
    }).rotateRight();
}
