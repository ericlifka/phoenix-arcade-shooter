import GameObject from '../models/game-object.js';

export default class FlyingSaucer extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = 100;
    team = 1;
    index = 5;

    constructor(parent?: GameObject | null) {
        super(parent);
        this.reset();
    }

    reset(): void {
        super.reset();
    }
}
