import Sprite from '../rendering/core/sprite.js';

/**
 * Radial guns ship — deep chevron with white wing-tip muzzles (option C1).
 * Plasma violet (Fleet A / radial).
 */
export default function playerShipRadialSprite(): any {
    const n = null;
    const t = '#ffffff';
    const c = '#f0e0ff';
    const h = '#f8f0ff';
    const m = '#c0a0e0';
    const w = '#9040c0';
    const e = '#502878';

    // Column-major (x, then y), nose up — matches other player ship sprites.
    return new Sprite([
        [n, n, n, n, n, t, w, w, n],
        [n, n, n, n, n, m, m, w, n],
        [n, n, n, n, m, m, m, n, n],
        [n, n, m, m, m, m, e, n, n],
        [t, t, c, c, h, e, e, e, e],
        [n, n, m, m, m, m, e, n, n],
        [n, n, n, n, m, m, m, n, n],
        [n, n, n, n, n, m, m, w, n],
        [n, n, n, n, n, t, w, w, n]
    ], {
        guns: [
            { x: 0, y: 6 },
            { x: 4, y: 1 },
            { x: 8, y: 6 }
        ]
    }).rotateLeft();
}
