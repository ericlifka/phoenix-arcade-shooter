import Sprite from '../rendering/core/sprite.js';

/**
 * Small distinct bomb projectile (vs thin bullet).
 */
export default function bombSprite(): Sprite {
    return new Sprite([
        [null, 'orange', null],
        ['orange', 'yellow', 'orange'],
        [null, 'orange', null]
    ]);
}
