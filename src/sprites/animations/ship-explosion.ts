import { integer } from '../../helpers/random.js';
import smallExplosion from './small-explosion.js';
import SpriteGroup from '../../../libs/pxlr-core/core/sprite-group.js';
import { Position } from '../../types/rendering';

/**
 * Creates a ship explosion animation with multiple small explosions
 */
export default function shipExplosion(offset?: Partial<Position>): any {
    const finalOffset = { x: offset?.x || 0, y: offset?.y || 0 };

    return new SpriteGroup([
        {
            x: 0 + finalOffset.x,
            y: integer(0, 3) + finalOffset.y,
            sprite: smallExplosion()
        },
        {
            x: integer(3, 6) + finalOffset.x,
            y: 0 + finalOffset.y,
            sprite: smallExplosion()
        },
        {
            x: integer(2, 4) + finalOffset.x,
            y: integer(4, 6) + finalOffset.y,
            sprite: smallExplosion()
        }
    ]);
}
