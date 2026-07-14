import Sprite from '../rendering/core/sprite.js';

/**
 * Dash boss — larger skimmer with wing guns + center gun.
 */
export default function dashBossSprite(): Sprite {
    const c1 = '#88eeff';
    const c2 = '#44aacc';
    const c3 = '#226688';
    const w1 = '#eeeeee';
    const g1 = '#999999';
    const g2 = '#555555';
    const nn = null;

    return new Sprite([
        [nn, nn, c3, nn, nn, nn, c2, c1, c2, nn, nn, nn, c3, nn, nn],
        [nn, c3, c2, c3, nn, c2, w1, w1, w1, c2, nn, c3, c2, c3, nn],
        [c3, c2, g1, c2, c3, w1, w1, c1, w1, w1, c3, c2, g1, c2, c3],
        [nn, c3, g2, g1, c2, c1, w1, w1, w1, c1, c2, g1, g2, c3, nn],
        [nn, nn, c3, nn, c3, c2, c1, w1, c1, c2, c3, nn, c3, nn, nn],
        [nn, nn, nn, nn, nn, c3, c2, c1, c2, c3, nn, nn, nn, nn, nn],
        [nn, nn, nn, nn, nn, nn, c3, c2, c3, nn, nn, nn, nn, nn, nn],
        [nn, nn, nn, nn, nn, nn, nn, c3, nn, nn, nn, nn, nn, nn, nn]
    ], {
        guns: [
            { x: 2, y: 4 },
            { x: 7, y: 7 },
            { x: 12, y: 4 }
        ]
    }).rotateRight();
}
