import Sprite from '../../libs/pxlr-core/core/sprite.js';

/**
 * Creates a simple 2-pixel bullet sprite
 */
export default function bulletSprite(): any {
    return new Sprite([
        ["white", "white"]
    ]);
}
