import Sprite from '../rendering/core/sprite.js';
import { Position } from '../types/rendering';

export interface DashSpriteOrientation {
    sprite: Sprite;
    guns: Position[];
}

/**
 * Dash scout — wide, angular interceptor (distinct from the vertical arrow ships).
 * Accent cyan so it reads as a different faction/behavior on screen.
 *
 * Four CW orientations are built once at module load so telegraph spins can
 * swap immutable sprites instead of reallocating pixel grids every quarter-turn.
 */
function buildOrientations(): ReadonlyArray<DashSpriteOrientation> {
    const c1 = '#88eeff';
    const c2 = '#44aacc';
    const c3 = '#226688';
    const w1 = '#eeeeee';
    const g1 = '#999999';
    const nn = null;

    // Columns are X; each array is top→bottom along Y.
    // Guns are authored for the post-rotateRight (default / index 0) facing.
    const working = new Sprite([
        [nn, nn, c3, c2, c1, c2, c3, nn, nn],
        [nn, c3, c2, w1, w1, w1, c2, c3, nn],
        [c3, c2, g1, c1, w1, c1, g1, c2, c3],
        [nn, c3, nn, c2, c1, c2, nn, c3, nn],
        [nn, nn, nn, nn, c2, nn, nn, nn, nn],
        [nn, nn, nn, nn, c3, nn, nn, nn, nn]
    ]).rotateRight();

    let guns: Position[] = [{ x: 4, y: 5 }];
    const orientations: DashSpriteOrientation[] = [];

    for (let i = 0; i < 4; i++) {
        const cachedGuns = guns.map((g) => ({ x: g.x, y: g.y }));
        const cached = working.clone();
        cached.meta = { guns: cachedGuns };
        orientations.push({ sprite: cached, guns: cachedGuns });

        const sh = working.height;
        guns = guns.map((g) => ({ x: sh - 1 - g.y, y: g.x }));
        working.rotateRight();
    }

    return orientations;
}

export const dashShipOrientations = buildOrientations();

export default function dashShipSprite(): Sprite {
    return dashShipOrientations[0].sprite;
}
