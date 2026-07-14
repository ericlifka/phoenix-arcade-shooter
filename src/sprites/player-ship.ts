import Sprite from '../rendering/core/sprite.js';

/**
 * Player ship — white ember shading (outline unchanged).
 */
export default function playerShipSprite(): any {
    const n = null;
    const t = '#ffffff'; // tip
    const c = '#ffe8c8'; // cockpit / warm core
    const h = '#fff0e0'; // highlight
    const m = '#ffd0a8'; // body
    const w = '#e87848'; // wing tip
    const e = '#a84028'; // trailing edge

    return new Sprite([
        [n, n, n, n, n, n, w, n, n],
        [n, n, n, n, n, w, m, n, n],
        [n, n, m, m, m, m, m, m, n],
        [t, t, c, c, c, e, h, e, e],
        [n, n, m, m, m, m, m, m, n],
        [n, n, n, n, n, w, m, n, n],
        [n, n, n, n, n, n, w, n, n]
    ], {
        guns: [
            { x: 3, y: 1 }
        ]
    }).rotateLeft();
}
