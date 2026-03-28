import Sprite from '../rendering/core/sprite.js';

/**
 * Creates the arrow boss sprite (large enemy boss ship)
 */
export default function arrowBossSprite(): any {
    const w1 = "#ffffff";
    const w2 = "#cccccc";
    const g1 = "#aaaaaa";
    const g2 = "#888888";
    const g3 = "#666666";
    const g4 = "#222222";
    const nn = null;
    return new Sprite([
            [ g3, nn, nn, nn, nn, nn, nn, nn, g3, nn, nn, nn, nn, nn, nn, nn, g3 ],
            [ g2, g2, nn, nn, nn, nn, g2, g2, w2, g2, g2, nn, nn, nn, nn, g2, g2 ],
            [ nn, g2, g1, nn, g1, g1, w2, w2, w2, w2, w2, g1, g1, nn, g1, g2, nn ],
            [ nn, g1, g1, g1, g1, w2, w2, w2, g3, w2, w2, w2, g1, g1, g1, g1, nn ],
            [ nn, nn, w2, g1, w2, w1, w2, g3, g4, g3, w2, w1, w2, g1, w2, nn, nn ],
            [ nn, nn, w2, w1, w2, w1, w1, w2, g3, w2, w1, w1, w2, w1, w2, nn, nn ],
            [ nn, nn, nn, w1, nn, nn, w1, w1, w2, w1, w1, nn, nn, w1, nn, nn, nn ],
            [ nn, nn, nn, w1, nn, nn, nn, w1, w1, w1, nn, nn, nn, w1, nn, nn, nn ],
            [ nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn ],
            [ nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn ],
            [ nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn ]
        ],
        {
            guns: [
                { x: 3, y: 8 },
                { x: 8, y: 10 },
                { x: 13, y: 8 }
            ]
        });
}
