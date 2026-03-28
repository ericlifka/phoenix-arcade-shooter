import Sprite from '../rendering/core/sprite.js';

/**
 * Creates a flying saucer enemy sprite (circular UFO shape)
 */
export default function flyingSaucerSprite(): any {
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
