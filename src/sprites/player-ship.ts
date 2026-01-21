import Sprite from '../../libs/pxlr-core/core/sprite.js';

/**
 * Creates the player ship sprite (white arrow pointing up)
 */
export default function playerShipSprite(): any {
    const w = "white";
    const n = null;
    return new Sprite([
        [ n, n, n, w, n, n, n ],
        [ n, n, n, w, n, n, n ],
        [ n, n, w, w, w, n, n ],
        [ n, n, w, w, w, n, n ],
        [ n, n, w, w, w, n, n ],
        [ n, w, w, w, w, w, n ],
        [ w, w, w, w, w, w, w ],
        [ n, n, w, w, w, n, n ],
        [ n, n, n, w, n, n, n ]
    ],
    {
        guns: [
            { x: 3, y: 1 }
        ]
    });
}
