import GameObject from '../models/game-object.js';
import { Position } from '../types/rendering';

type MovableObject = GameObject & {
    position: Position;
    velocity: { x: number; y: number };
    orbitPathOffset?: Position;
};

function resolveTarget(object: MovableObject, target: Position): Position {
    const offset = object.orbitPathOffset ?? { x: 0, y: 0 };
    return { x: target.x + offset.x, y: target.y + offset.y };
}

export default class MoveObjectToPoint extends GameObject {
    object: MovableObject;
    target: Position;
    resolvedTarget!: Position;
    delta: number;
    xPositive!: boolean;
    yPositive!: boolean;

    constructor(
        parent: GameObject | null | undefined,
        object: MovableObject,
        targetPoint: Position,
        timeDelta: number
    ) {
        super(parent);

        this.object = object;
        this.target = targetPoint;
        this.delta = timeDelta;

        this.reset();
    }

    start(): void {
        const current = this.object.position;
        this.resolvedTarget = resolveTarget(this.object, this.target);

        const xDiff = this.resolvedTarget.x - current.x;
        const yDiff = this.resolvedTarget.y - current.y;

        this.object.velocity.x = xDiff / this.delta;
        this.object.velocity.y = yDiff / this.delta;

        this.xPositive = xDiff > 0;
        this.yPositive = yDiff > 0;
    }

    update(dtime: number): void {
        super.update(dtime);

        if (this.metXThreshold() && this.metYThreshold()) {
            this.object.velocity.x = 0;
            this.object.velocity.y = 0;

            this.object.position.x = this.resolvedTarget.x;
            this.object.position.y = this.resolvedTarget.y;

            this.parent!.removeChild(this);
        }
    }

    metXThreshold(): boolean {
        return (
            (this.xPositive && this.object.position.x >= this.resolvedTarget.x) ||
            (!this.xPositive && this.object.position.x <= this.resolvedTarget.x)
        );
    }

    metYThreshold(): boolean {
        return (
            (this.yPositive && this.object.position.y >= this.resolvedTarget.y) ||
            (!this.yPositive && this.object.position.y <= this.resolvedTarget.y)
        );
    }
}
