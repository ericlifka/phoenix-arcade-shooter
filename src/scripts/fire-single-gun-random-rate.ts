import GameObject from '../models/game-object.js';
import { integer } from '../helpers/random.js';

/** Ships that expose `fire` for scripted firing (e.g. boss multi-gun). */
type ShipWithFire = GameObject & {
    fire(gunIndex?: number): void;
};

export interface FireSingleGunRandomRateOptions {
    gunIndex?: number;
    thresholdMin?: number;
    thresholdMax?: number;
}

export default class FireSingleGunRandomRate extends GameObject {
    ship: ShipWithFire;
    gunIndex: number;
    thresholdMin: number;
    thresholdMax: number;
    elapsed!: number;
    threshold!: number;

    constructor(parent: GameObject | null | undefined, ship: ShipWithFire, options?: FireSingleGunRandomRateOptions) {
        super(parent);
        const opts = options || {};

        this.ship = ship;
        this.gunIndex = opts.gunIndex ?? 0;
        this.thresholdMin = opts.thresholdMin ?? 1000;
        this.thresholdMax = opts.thresholdMax ?? 3000;

        this.reset();
    }

    start(): void {
        this.resetTimer();
        this.threshold += this.thresholdMax;
    }

    update(dtime: number): void {
        if (this.ship.destroyed) {
            this.destroy();
        }

        this.elapsed += dtime;

        if (this.elapsed > this.threshold) {
            this.resetTimer();
            this.ship.fire(this.gunIndex);
        }
    }

    resetTimer(): void {
        this.elapsed = 0;
        this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
}
