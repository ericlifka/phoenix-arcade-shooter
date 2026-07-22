import GameObject from '../models/game-object.js';
import {
    UPGRADE_RANK_ORB_SIZE,
    UPGRADE_RANK_ORB_STRIDE,
    upgradeRankOrbSprite
} from '../sprites/energy-shield.js';

/**
 * Horizontal row of upgrade-rank orbs (filled = owned, empty outline = remaining).
 * Right-aligned: set `rightX` to the exclusive right edge of the rightmost orb.
 */
export default class UpgradeProgressOrbs extends GameObject {
    index = 2;
    private owned = 0;
    private max = 0;
    private rightX = 0;
    private rowY = 0;

    constructor(parent: GameObject | null | undefined, rightX: number, rowY: number) {
        super(parent);
        this.rightX = rightX;
        this.rowY = rowY;
        this.position = { x: rightX, y: rowY };
    }

    setProgress(owned: number, max: number): void {
        const nextOwned = Math.max(0, Math.min(owned, max));
        if (nextOwned === this.owned && max === this.max) {
            return;
        }

        this.owned = nextOwned;
        this.max = max;
        this.rebuild();
    }

    private rebuild(): void {
        this.children = [];

        if (this.max <= 0) {
            return;
        }

        // Width of max orbs with 1px horizontal overlap: max * stride + 1
        const width = this.max * UPGRADE_RANK_ORB_STRIDE + 1;
        const leftX = this.rightX - width;
        this.position = { x: leftX, y: this.rowY };

        for (let i = 0; i < this.max; i++) {
            const orb = new GameObject(this);
            orb.sprite = upgradeRankOrbSprite(i < this.owned);
            orb.position = {
                x: leftX + i * UPGRADE_RANK_ORB_STRIDE,
                y: this.rowY
            };
            orb.index = this.index;
            this.addChild(orb);
        }
    }

    /** Pixel height of an orb (for vertical centering against text if needed). */
    static get orbSize(): number {
        return UPGRADE_RANK_ORB_SIZE;
    }
}
