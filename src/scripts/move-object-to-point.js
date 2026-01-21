import GameObject from '../models/game-object.js';

export default class MoveObjectToPoint extends GameObject {
    constructor(parent, object, targetPoint, timeDelta) {
        super(parent);

        this.object = object;
        this.target = targetPoint;
        this.delta = timeDelta;
    }

    start() {
        const current = this.object.position;

        const xDiff = this.target.x - current.x;
        const yDiff = this.target.y - current.y;

        this.object.velocity.x = xDiff / this.delta;
        this.object.velocity.y = yDiff / this.delta;

        this.xPositive = xDiff > 0;
        this.yPositive = yDiff > 0;
    }

    update(dtime) {
        super.update(dtime);

        if (this.metXThreshold() && this.metYThreshold()) {
            this.object.velocity.x = 0;
            this.object.velocity.y = 0;

            this.object.position.x = this.target.x;
            this.object.position.y = this.target.y;

            this.parent.removeChild(this);
        }
    }

    metXThreshold() {
        return (
            this.xPositive && this.object.position.x >= this.target.x ||
            !this.xPositive && this.object.position.x <= this.target.x
        );
    }

    metYThreshold() {
        return (
            this.yPositive && this.object.position.y >= this.target.y ||
            !this.yPositive && this.object.position.y <= this.target.y
        );
    }
}
