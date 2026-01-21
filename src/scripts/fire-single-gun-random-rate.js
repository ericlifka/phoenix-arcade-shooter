import GameObject from '../models/game-object.js';
import { integer } from '../helpers/random.js';

export default class FireSingleGunRandomRate extends GameObject {
    constructor(parent, ship, options) {
        super(parent);
        options = options || {};

        this.ship = ship;
        this.gunIndex = options.gunIndex || 0;
        this.thresholdMin = options.thresholdMin || 1000;
        this.thresholdMax = options.thresholdMax || 3000;
        
        this.reset();
    }

    start() {
        this.resetTimer();
        this.threshold += this.thresholdMax;
    }

    update(dtime) {
        if (this.ship.destroyed) {
            this.destroy();
        }

        this.elapsed += dtime;

        if (this.elapsed > this.threshold) {
            this.resetTimer();
            this.ship.fire(this.gunIndex);
        }
    }

    resetTimer() {
        this.elapsed = 0;
        this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
}
