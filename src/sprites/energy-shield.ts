import Sprite from '../rendering/core/sprite.js';
import type { Position } from '../types/rendering';

/** Light blue used for ship outline and orb cores — tweak freely. */
export const ENERGY_SHIELD_COLOR = '#7ec8ff';

/** Full-health green from GreenToRed — filled shop upgrade ranks. */
export const UPGRADE_RANK_FILL_COLOR = 'hsl(120, 100%, 50%)';

const n = null;
const w = '#ffffff';

/**
 * 6×6 orb with white outline and optional core color.
 * Pattern (rows top→bottom): .****. / **cc** / *cccc* / *cccc* / **cc** / .****.
 */
export function orbSprite(coreColor: string | null): Sprite {
    const c = coreColor;
    return new Sprite([
        [n, w, w, w, w, n],
        [w, w, c, c, w, w],
        [w, c, c, c, c, w],
        [w, c, c, c, c, w],
        [w, w, c, c, w, w],
        [n, w, w, w, w, n]
    ]);
}

/**
 * Energy shield HUD orb (6x6).
 */
export function energyShieldOrbSprite(): Sprite {
    return orbSprite(ENERGY_SHIELD_COLOR);
}

/** Shop upgrade rank orb — green fill when owned, empty outline when not. */
export function upgradeRankOrbSprite(filled: boolean): Sprite {
    return orbSprite(filled ? UPGRADE_RANK_FILL_COLOR : null);
}

export const ENERGY_SHIELD_ORB_SIZE = 6;
export const UPGRADE_RANK_ORB_SIZE = 6;
/** Y distance between stacked orb tops (size - 1 so only one pixel row overlaps). */
export const ENERGY_SHIELD_ORB_STRIDE = 5;
/** X distance between horizontal upgrade-rank orb lefts. */
export const UPGRADE_RANK_ORB_STRIDE = 5;

/**
 * Expand a sprite by 1px and paint a silhouette outline in empty cells
 * adjacent (including diagonally) to filled body pixels. Gun meta is shifted +1,+1.
 */
export function applySilhouetteOutline(sprite: Sprite, outlineColor: string = ENERGY_SHIELD_COLOR): Sprite {
    const w0 = sprite.width;
    const h0 = sprite.height;
    const body: (string | null)[][] = [];

    for (let x = 0; x < w0 + 2; x++) {
        body[x] = [];
        for (let y = 0; y < h0 + 2; y++) {
            body[x][y] = null;
        }
    }

    for (let x = 0; x < w0; x++) {
        for (let y = 0; y < h0; y++) {
            body[x + 1][y + 1] = sprite.cells[x][y].color;
        }
    }

    const pixels: (string | null)[][] = body.map((col) => col.slice());

    const isBody = (x: number, y: number): boolean =>
        x >= 0 && y >= 0 && x < body.length && y < body[0].length && !!body[x][y];

    for (let x = 0; x < pixels.length; x++) {
        for (let y = 0; y < pixels[0].length; y++) {
            if (pixels[x][y]) continue;
            if (
                isBody(x - 1, y) ||
                isBody(x + 1, y) ||
                isBody(x, y - 1) ||
                isBody(x, y + 1) ||
                isBody(x - 1, y - 1) ||
                isBody(x + 1, y - 1) ||
                isBody(x - 1, y + 1) ||
                isBody(x + 1, y + 1)
            ) {
                pixels[x][y] = outlineColor;
            }
        }
    }

    const outlined = new Sprite(pixels);
    const guns = (sprite.meta.guns as Position[] | undefined) || [];
    outlined.meta = {
        ...sprite.meta,
        guns: guns.map((g) => ({ x: g.x + 1, y: g.y + 1 }))
    };
    outlined.setPermanentOffset(sprite.offsetAdjustment);

    return outlined;
}
