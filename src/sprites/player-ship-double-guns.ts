import Sprite from '../rendering/core/sprite.js';

/**
 * Player ship with wing guns only (no center gun)
 */
export default function playerShipDoubleGunsSprite(): any {
    const w = "white";
    const n = null;
    return new Sprite([
        [n, n, n, n, n, n, n, n, n],
        [n, n, n, n, w, n, n, n, n],
        [n, n, n, w, w, w, n, n, n],
        [n, n, n, w, w, w, n, n, n],
        [n, n, n, w, w, w, n, n, n],
        [w, n, w, w, w, w, w, n, w],
        [w, w, w, w, w, w, w, w, w],
        [n, n, n, w, w, w, n, n, n],
        [n, n, n, n, w, n, n, n, n]
    ], {
        guns: [
            { x: 0, y: 6 },
            { x: 8, y: 6 }
        ]
    });
}
