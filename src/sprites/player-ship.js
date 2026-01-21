import Sprite from '../../libs/pxlr-core/core/sprite.js';

export default function playerShipSprite() {
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
