import GameObject from '../models/game-object.js';
import { Position } from '../types/rendering';

type MovableObject = GameObject & {
    position: Position;
    velocity: { x: number; y: number };
};

export interface MoveObjectInCircleOptions {
    center: Position;
    radius: number;
    /** Seconds for one full revolution. */
    period: number;
    clockwise: boolean;
}

/**
 * Moves an object along a circular path indefinitely.
 */
export default class MoveObjectInCircle extends GameObject {
    object: MovableObject;
    centerX: number;
    centerY: number;
    radius: number;
    angularVelocity: number;
    angle: number;

    constructor(
        parent: GameObject | null | undefined,
        object: MovableObject,
        options: MoveObjectInCircleOptions
    ) {
        super(parent);

        this.object = object;
        this.centerX = options.center.x;
        this.centerY = options.center.y;
        this.radius = options.radius;

        const direction = options.clockwise ? 1 : -1;
        this.angularVelocity = direction * ((2 * Math.PI) / options.period);
        this.angle = 0;
    }

    start(): void {
        const pos = this.object.position;
        this.angle = Math.atan2(pos.y - this.centerY, pos.x - this.centerX);
        this.object.velocity.x = 0;
        this.object.velocity.y = 0;
        this.applyPosition();
    }

    update(dtime: number): void {
        if (this.object.destroyed) {
            this.destroy();
            return;
        }

        this.angle += this.angularVelocity * (dtime / 1000);
        this.applyPosition();
    }

    private applyPosition(): void {
        this.object.position.x = this.centerX + this.radius * Math.cos(this.angle);
        this.object.position.y = this.centerY + this.radius * Math.sin(this.angle);
    }
}
