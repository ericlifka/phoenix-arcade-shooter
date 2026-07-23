import Sprite from '../rendering/core/sprite.js';

/**
 * Player ship with wing guns only — crimson (Fleet A / double).
 */
export default function playerShipDoubleGunsSprite(): any {
    const n = null;
    const t = '#ffffff';
    const c = '#ffe0e0';
    const h = '#fff0f0';
    const m = '#e09898';
    const w = '#c04040';
    const e = '#702020';

    return new Sprite([
        [n, n, n, n, n, w, w, n, n],
        [n, n, n, n, n, n, m, n, n],
        [n, n, n, n, n, m, m, n, n],
        [n, n, m, m, m, m, m, m, n],
        [n, t, c, c, c, e, h, e, e],
        [n, n, m, m, m, m, m, m, n],
        [n, n, n, n, n, m, m, n, n],
        [n, n, n, n, n, n, m, n, n],
        [n, n, n, n, n, w, w, n, n]
    ], {
        guns: [
            { x: 0, y: 6 },
            { x: 8, y: 6 }
        ]
    }).rotateLeft();
}
