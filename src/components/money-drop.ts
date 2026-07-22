import GameObject from '../models/game-object.js';
import ArcadeFont from '../rendering/fonts/arcade.js';
import { MONEY_DROP_FALL_SPEED, MONEY_DROP_VALUE } from '../balance/economy.js';
import { Position, Velocity } from '../types/rendering';

/**
 * Collectible money drop that appears when enemies are destroyed
 */
export default class MoneyDrop extends GameObject {
    isPhysicalEntity = true;
    type = "pickup";
    team = 1;
    index = 4;
    value: number;

    constructor(parent: GameObject, position: Position, velocity?: Velocity) {
        super(parent);

        this.value = MONEY_DROP_VALUE;
        this.position = { x: position.x, y: position.y };
        this.velocity = velocity
            ? { x: velocity.x, y: velocity.y }
            : { x: 0, y: MONEY_DROP_FALL_SPEED };
        this.sprite = ArcadeFont['$'];

        this.reset();
    }

    checkBoundaries(): void {
        if (this.position && this.parent) {
            const parentWidth = (this.parent as any).width;
            const parentHeight = (this.parent as any).height;

            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x > parentWidth
                || this.position.y > parentHeight) {

                this.destroy();
            }
        }
    }

    applyDamage(damage: number, sourceEntity?: GameObject): void {
        if (sourceEntity && (sourceEntity as any).type === "player") {
            this.triggerEvent('moneyCollected', this.value);
            this.destroy();
        } else if (sourceEntity && (sourceEntity as any).type === "bomb") {
            this.destroy();
        }
    }
}
