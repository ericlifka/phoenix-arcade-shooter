import GameObject from '../models/game-object.js';
import { integer } from '../helpers/random.js';

export default class ChainGunFire extends GameObject {
    constructor(parent, ship, options) {
        super(parent);
        options = options || {};

        this.ship = ship;
        this.gunIndex = options.gunIndex || 0;
        this.fireRate = options.fireRate || 150;
        this.burstSize = options.burstSize || 5;
        this.thresholdMin = options.thresholdMin || 2000;
        this.thresholdMax = options.thresholdMax || 6000;
        
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

        if (this.firing) {

            if (this.elapsed > this.fireRate) {
                this.elapsed -= this.fireRate;
                this.burstCount++;
                this.ship.fire(this.gunIndex);

                if (this.burstCount > this.burstSize) {
                    this.firing = false;
                    this.resetTimer();
                }
            }

        }
        else {

            if (this.elapsed > this.threshold) {
                this.firing = true;
                this.elapsed = 0;
                this.burstCount = 0;
            }

        }
    }

    resetTimer() {
        this.elapsed = 0;
        this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
}
