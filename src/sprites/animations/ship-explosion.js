import { integer } from '../../helpers/random.js';
import smallExplosion from './small-explosion.js';
import SpriteGroup from '../../../libs/pxlr-core/core/sprite-group.js';

export default function shipExplosion(offset) {
    offset = offset || { x: 0, y: 0 };

    return new SpriteGroup([
        {
            x: 0 + offset.x,
            y: integer(0, 3) + offset.y,
            sprite: smallExplosion()
        },
        {
            x: integer(3, 6) + offset.x,
            y: 0 + offset.y,
            sprite: smallExplosion()
        },
        {
            x: integer(2, 4) + offset.x,
            y: integer(4, 6) + offset.y,
            sprite: smallExplosion()
        }
    ]);
}
