import Sprite from '../../libs/pxlr-core/core/sprite.js';

export default function daggerShipSprite() {
    const w1 = "#ffffff";
    const w2 = "#cccccc";
    const g1 = "#aaaaaa";
    const g2 = "#888888";
    const g3 = "#666666";
    const g4 = "#222222";
    const nn = null;
    return new Sprite([
        [ nn, nn, w1, nn, nn ],
        [ nn, nn, w1, nn, nn ],
        [ nn, nn, w1, nn, nn ],
        [ nn, w2, w1, w2, nn ],
        [ nn, w2, g4, w2, nn ],
        [ nn, w2, w1, w2, nn ],
        [ nn, g2, g1, g2, nn ],
        [ g2, g2, nn, g2, g2 ],
        [ g3, nn, nn, nn, g3 ]
    ], {
        guns: [ { x: 2, y: 8 } ]
    });
}
