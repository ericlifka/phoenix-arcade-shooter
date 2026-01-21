import Sprite from '../../libs/pxlr-core/core/sprite.js';

export default function flyingSaucerSprite() {
    const w = "white";
    const n = null;
    return new Sprite([
            [ n, n, n, w, w, w, w, w, n, n, n ],
            [ n, n, w, n, n, n, n, n, w, n, n ],
            [ n, w, n, n, n, n, n, n, n, w, n ],
            [ w, n, n, n, n, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, n, n, n, n, w ],
            [ w, n, n, n, n, w, n, n, n, n, w ],
            [ w, n, n, n, n, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, n, n, n, n, w ],
            [ n, w, n, n, n, n, n, n, n, w, n ],
            [ n, n, w, n, n, n, n, n, w, n, n ],
            [ n, n, n, w, w, w, w, w, n, n, n ]
        ],
        {
            guns: []
        });
}
