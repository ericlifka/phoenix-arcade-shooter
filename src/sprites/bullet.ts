import Sprite from '../rendering/core/sprite.js';

/**
 * Creates a simple 2-pixel bullet sprite
 */
export default function bulletSprite(): any {
    return new Sprite([
        ["white", "white"]
    ]);
}
