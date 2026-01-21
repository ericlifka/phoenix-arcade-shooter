import GameObject from '../models/game-object.js';

export default class WatchForDeath extends GameObject {
    constructor(parent, entity, callback) {
        super(parent);

        this.entity = entity;
        this.callback = callback;
        this.started = false;
        
        this.reset();
    }

    update() {
        if (this.entity.destroyed && this.started) {
            this.started = false;
            this.callback();
            this.destroy();
        }
    }

    start() {
        this.started = true;
    }
}
