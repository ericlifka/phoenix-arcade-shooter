import { integer } from '../../helpers/random.js';
import smallExplosion from './small-explosion.js';
import SpriteGroup from '../../rendering/core/sprite-group.js';

/**
 * Wide layered bomb blast — denser/larger than a ship explosion.
 */
export default function bombExplosion(): SpriteGroup {
    const sprites: { x: number; y: number; sprite: ReturnType<typeof smallExplosion> }[] = [];
    const center = 20;

    for (let ring = 0; ring < 5; ring++) {
        const count = 4 + ring * 2;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + ring * 0.2;
            const dist = ring * 4 + integer(0, 2);
            sprites.push({
                x: center + Math.round(Math.cos(angle) * dist),
                y: center + Math.round(Math.sin(angle) * dist),
                sprite: smallExplosion()
            });
        }
    }

    // Dense core
    for (let i = 0; i < 6; i++) {
        sprites.push({
            x: center + integer(-3, 3),
            y: center + integer(-3, 3),
            sprite: smallExplosion()
        });
    }

    return new SpriteGroup(sprites);
}
