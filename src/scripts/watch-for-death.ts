import GameObject from '../models/game-object.js';

export default class WatchForDeath extends GameObject {
    entity: GameObject;
    callback: () => void;
    started = false;

    constructor(parent: GameObject | null | undefined, entity: GameObject, callback: () => void) {
        super(parent);

        this.entity = entity;
        this.callback = callback;

        this.reset();
    }

    update(_dtime: number): void {
        if (this.entity.destroyed && this.started) {
            this.started = false;
            this.callback();
            this.destroy();
        }
    }

    start(): void {
        this.started = true;
    }
}
