import Sprite from '../rendering/core/sprite.js';

/**
 * Creates the combo gauge frame sprite (border for the combo meter)
 */
export default function comboGaugeSprite(): any {
    const w = "#fff";
    const n = null;

    return new Sprite([
        [n,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,n],
        [w,w,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,w,w],
        [w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,w],
        [w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,w],
        [w,w,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,w,w],
        [n,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,n]
    ]);
}
