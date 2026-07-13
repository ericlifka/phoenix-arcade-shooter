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
    /** Milliseconds before the first shot can fire. */
    initialDelayMs?: number;
}

export default class FireSingleGunRandomRate extends GameObject {
    ship: ShipWithFire;
    gunIndex: number;
    thresholdMin: number;
    thresholdMax: number;
    initialDelayMs: number;
    elapsed!: number;
    threshold!: number;
    private delayElapsed = 0;
    private firing = false;

    constructor(parent: GameObject | null | undefined, ship: ShipWithFire, options?: FireSingleGunRandomRateOptions) {
        super(parent);
        const opts = options || {};

        this.ship = ship;
        this.gunIndex = opts.gunIndex ?? 0;
        this.thresholdMin = opts.thresholdMin ?? 1000;
        this.thresholdMax = opts.thresholdMax ?? 3000;
        this.initialDelayMs = opts.initialDelayMs ?? 0;

        this.reset();
    }

    start(): void {
        this.delayElapsed = 0;
        this.firing = this.initialDelayMs <= 0;

        if (this.firing) {
            this.beginFiring();
        }
    }

    update(dtime: number): void {
        if (this.ship.destroyed) {
            this.destroy();
            return;
        }

        if (!this.firing) {
            this.delayElapsed += dtime;
            if (this.delayElapsed >= this.initialDelayMs) {
                this.beginFiring();
            }
            return;
        }

        this.elapsed += dtime;

        if (this.elapsed > this.threshold) {
            this.resetTimer();
            this.ship.fire(this.gunIndex);
        }
    }

    private beginFiring(): void {
        this.firing = true;
        this.resetTimer();
        this.threshold += this.thresholdMax;
    }

    resetTimer(): void {
        this.elapsed = 0;
        this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
}
