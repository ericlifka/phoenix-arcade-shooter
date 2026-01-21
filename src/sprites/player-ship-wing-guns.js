import Sprite from '../../libs/pxlr-core/core/sprite.js';

export default function playerShipWingGunsSprite() {
    const w = "white";
    const n = null;
    return new Sprite([
            [ n, n, n, n, w, n, n, n, n ],
            [ n, n, n, n, w, n, n, n, n ],
            [ n, n, n, w, w, w, n, n, n ],
            [ n, n, n, w, w, w, n, n, n ],
            [ w, n, n, w, w, w, n, n, w ],
            [ w, n, w, w, w, w, w, n, w ],
            [ w, w, w, w, w, w, w, w, w ],
            [ n, n, n, w, w, w, n, n, n ],
            [ n, n, n, n, w, n, n, n, n ]
        ],
        {
            guns: [
                { x: 0, y: 5 },
                { x: 4, y: 1 },
                { x: 8, y: 5 }
            ]
        });
}
