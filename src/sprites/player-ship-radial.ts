import Sprite from '../rendering/core/sprite.js';

/**
 * Radial guns ship — deep chevron with white wing-tip muzzles (option C1).
 * Same white-ember palette as other player hulls.
 */
export default function playerShipRadialSprite(): any {
    const n = null;
    const t = '#ffffff';
    const c = '#ffe8c8';
    const h = '#fff0e0';
    const m = '#ffd0a8';
    const w = '#e87848';
    const e = '#a84028';

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
