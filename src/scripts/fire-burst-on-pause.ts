import GameObject from '../models/game-object.js';
import { burstOnPause } from '../balance/fire.js';
import type { DashPhase } from '../ships/dash-ship.js';

type ShipWithPhaseFire = GameObject & {
    phase: DashPhase;
    destroyed: boolean;
    fire(gunIndex?: number): void;
};

export interface FireBurstOnPauseOptions {
    gunIndex?: number;
    /** Shots fired during each pause window. */
    burstSize?: number;
    /** Milliseconds between shots in a burst. */
    fireRateMs?: number;
    /** Wait this long after pause begins before the first shot. */
    windupMs?: number;
}

/**
 * Fires a short burst each time the ship enters the `'pause'` phase
 * (after the telegraph spin completes).
 */
export default class FireBurstOnPause extends GameObject {
    ship: ShipWithPhaseFire;
    gunIndex: number;
    burstSize: number;
    fireRateMs: number;
    windupMs: number;

    private lastPhase: DashPhase = 'idle';
    private shotsRemaining = 0;
    private cooldown = 0;
    private windup = 0;
    private armed = false;

    constructor(
        parent: GameObject | null | undefined,
        ship: ShipWithPhaseFire,
        options?: FireBurstOnPauseOptions
    ) {
        super(parent);
        const opts = options || {};
        this.ship = ship;
        this.gunIndex = opts.gunIndex ?? 0;
        this.burstSize = opts.burstSize ?? burstOnPause.burstSize;
        this.fireRateMs = opts.fireRateMs ?? burstOnPause.fireRateMs;
        this.windupMs = opts.windupMs ?? burstOnPause.windupMs;
    }

    start(): void {
        this.lastPhase = this.ship.phase;
        this.shotsRemaining = 0;
        this.armed = false;
    }

    update(dtime: number): void {
        if (this.ship.destroyed) {
            this.destroy();
            return;
        }

        if (this.ship.phase === 'pause' && this.lastPhase !== 'pause') {
            this.armBurst();
        }

        if (this.ship.phase !== 'pause') {
            this.armed = false;
            this.shotsRemaining = 0;
        }

        this.lastPhase = this.ship.phase;

        if (!this.armed || this.shotsRemaining <= 0) {
            return;
        }

        if (this.windup > 0) {
            this.windup -= dtime;
            return;
        }

        this.cooldown -= dtime;
        if (this.cooldown <= 0) {
            this.ship.fire(this.gunIndex);
            this.shotsRemaining--;
            this.cooldown = this.fireRateMs;
            if (this.shotsRemaining <= 0) {
                this.armed = false;
            }
        }
    }

    private armBurst(): void {
        this.armed = true;
        this.shotsRemaining = this.burstSize;
        this.windup = this.windupMs;
        this.cooldown = 0;
    }
}
