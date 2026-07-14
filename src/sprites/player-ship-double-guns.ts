import Sprite from '../rendering/core/sprite.js';

/**
 * Player ship with wing guns only — white ember shading (outline unchanged).
 */
export default function playerShipDoubleGunsSprite(): any {
    const n = null;
    const t = '#ffffff';
    const c = '#ffe8c8';
    const h = '#fff0e0';
    const m = '#ffd0a8';
    const w = '#e87848';
    const e = '#a84028';

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
