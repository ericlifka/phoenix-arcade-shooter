import GameObject from '../models/game-object.js';
import { integer } from '../helpers/random.js';
import { chainGunFire } from '../balance/fire.js';

type ShipWithFire = GameObject & {
    fire(gunIndex?: number): void;
};

export interface ChainGunFireOptions {
    gunIndex?: number;
    fireRate?: number;
    burstSize?: number;
    thresholdMin?: number;
    thresholdMax?: number;
}

export default class ChainGunFire extends GameObject {
    ship: ShipWithFire;
    gunIndex: number;
    fireRate: number;
    burstSize: number;
    thresholdMin: number;
    thresholdMax: number;
    elapsed!: number;
    threshold!: number;
    firing?: boolean;
    burstCount!: number;

    constructor(parent: GameObject | null | undefined, ship: ShipWithFire, options?: ChainGunFireOptions) {
        super(parent);
        const opts = options || {};

        this.ship = ship;
        this.gunIndex = opts.gunIndex ?? 0;
        this.fireRate = opts.fireRate ?? chainGunFire.fireRateMs;
        this.burstSize = opts.burstSize ?? chainGunFire.burstSize;
        this.thresholdMin = opts.thresholdMin ?? chainGunFire.thresholdMinMs;
        this.thresholdMax = opts.thresholdMax ?? chainGunFire.thresholdMaxMs;

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

    resetTimer(): void {
        this.elapsed = 0;
        this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
}
