import GameObject from '../models/game-object.js';
import { integer } from '../helpers/random.js';
import { Position } from '../types/rendering';
import type { DashPhase } from '../ships/dash-ship.js';

type DashableShip = GameObject & {
    position: Position;
    velocity: { x: number; y: number };
    phase: DashPhase;
    destroyed: boolean;
    sprite?: { width: number; height: number };
    spinQuarterLeft(): void;
    spinQuarterRight(): void;
};

export interface DashAndPauseOptions {
    /** Inclusive playfield bounds for waypoint picks. */
    bounds: { left: number; right: number; top: number; bottom: number };
    /** Pixels / second while dashing. */
    dashSpeed?: number;
    /** Pause (firing) duration range in seconds. */
    pauseSecondsMin?: number;
    pauseSecondsMax?: number;
    /** Full spin telegraph duration in seconds (default 0.5). */
    telegraphSeconds?: number;
    /** Max distance of a single dash (keeps hops readable). */
    maxDashDistance?: number;
    /** Min distance so dashes feel intentional. */
    minDashDistance?: number;
    /** Initial off-screen wait before first dash (seconds). */
    initialWaitSecondsMin?: number;
    initialWaitSecondsMax?: number;
}

const TELEGRAPH_QUARTERS = 4;

/**
 * Dash → telegraph spin → pause (fire) → repeat.
 * Sets `ship.phase` for companion firing scripts (`'pause'` is when they should shoot).
 */
export default class DashAndPause extends GameObject {
    ship: DashableShip;
    bounds: DashAndPauseOptions['bounds'];
    dashSpeed: number;
    pauseSecondsMin: number;
    pauseSecondsMax: number;
    telegraphSeconds: number;
    maxDashDistance: number;
    minDashDistance: number;
    initialWaitSecondsMin: number;
    initialWaitSecondsMax: number;

    private target: Position | null = null;
    private pauseRemaining = 0;
    private telegraphElapsed = 0;
    private telegraphQuartersDone = 0;
    private initialWaitRemaining = 0;
    private telegraphSpinRight = false;

    constructor(
        parent: GameObject | null | undefined,
        ship: DashableShip,
        options: DashAndPauseOptions
    ) {
        super(parent);
        this.ship = ship;
        this.bounds = options.bounds;
        this.dashSpeed = options.dashSpeed ?? 120;
        this.pauseSecondsMin = options.pauseSecondsMin ?? 0.8;
        this.pauseSecondsMax = options.pauseSecondsMax ?? 1.6;
        this.telegraphSeconds = options.telegraphSeconds ?? 0.38;
        this.maxDashDistance = options.maxDashDistance ?? 70;
        this.minDashDistance = options.minDashDistance ?? 25;
        this.initialWaitSecondsMin = options.initialWaitSecondsMin ?? 1;
        this.initialWaitSecondsMax = options.initialWaitSecondsMax ?? 10;
    }

    start(): void {
        this.ship.phase = 'idle';
        this.ship.velocity.x = 0;
        this.ship.velocity.y = 0;
        const minMs = Math.floor(this.initialWaitSecondsMin * 1000);
        const maxMs = Math.floor(this.initialWaitSecondsMax * 1000);
        this.initialWaitRemaining = integer(minMs, maxMs) / 1000;
    }

    update(dtime: number): void {
        if (this.ship.destroyed) {
            this.destroy();
            return;
        }

        const dt = dtime / 1000;

        if (this.ship.phase === 'idle') {
            this.initialWaitRemaining -= dt;
            if (this.initialWaitRemaining <= 0) {
                this.beginDash();
            }
            return;
        }

        if (this.ship.phase === 'telegraph') {
            this.updateTelegraph(dt);
            return;
        }

        if (this.ship.phase === 'pause') {
            this.pauseRemaining -= dt;
            if (this.pauseRemaining <= 0) {
                this.beginDash();
            }
            return;
        }

        if (this.ship.phase === 'dash' && this.target) {
            const dx = this.target.x - this.ship.position.x;
            const dy = this.target.y - this.ship.position.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 1.5 || this.dashSpeed * dt >= dist) {
                this.ship.position.x = this.target.x;
                this.ship.position.y = this.target.y;
                this.ship.velocity.x = 0;
                this.ship.velocity.y = 0;
                this.beginTelegraph();
                return;
            }

            this.ship.velocity.x = (dx / dist) * this.dashSpeed;
            this.ship.velocity.y = (dy / dist) * this.dashSpeed;
        }
    }

    private updateTelegraph(dt: number): void {
        this.telegraphElapsed += dt;
        const step = this.telegraphSeconds / TELEGRAPH_QUARTERS;

        while (
            this.telegraphQuartersDone < TELEGRAPH_QUARTERS &&
            this.telegraphElapsed >= (this.telegraphQuartersDone + 1) * step
        ) {
            if (this.telegraphSpinRight) {
                this.ship.spinQuarterRight();
            } else {
                this.ship.spinQuarterLeft();
            }
            this.telegraphQuartersDone++;
        }

        if (this.telegraphElapsed >= this.telegraphSeconds) {
            this.beginPause();
        }
    }

    private beginTelegraph(): void {
        this.ship.phase = 'telegraph';
        this.ship.velocity.x = 0;
        this.ship.velocity.y = 0;
        this.target = null;
        this.telegraphElapsed = 0;
        this.telegraphQuartersDone = 0;
        this.telegraphSpinRight = integer(0, 1) === 1;
    }

    private beginPause(): void {
        this.ship.phase = 'pause';
        this.ship.velocity.x = 0;
        this.ship.velocity.y = 0;
        this.target = null;
        const minMs = Math.floor(this.pauseSecondsMin * 1000);
        const maxMs = Math.floor(this.pauseSecondsMax * 1000);
        this.pauseRemaining = integer(minMs, maxMs) / 1000;
    }

    private beginDash(): void {
        this.target = this.pickWaypoint();
        this.ship.phase = 'dash';

        const dx = this.target.x - this.ship.position.x;
        const dy = this.target.y - this.ship.position.y;
        const dist = Math.hypot(dx, dy) || 1;
        this.ship.velocity.x = (dx / dist) * this.dashSpeed;
        this.ship.velocity.y = (dy / dist) * this.dashSpeed;
    }

    private pickWaypoint(): Position {
        const spriteW = this.ship.sprite?.width ?? 8;
        const spriteH = this.ship.sprite?.height ?? 6;
        const left = this.bounds.left;
        const right = Math.max(left, this.bounds.right - spriteW);
        const top = this.bounds.top;
        const bottom = Math.max(top, this.bounds.bottom - spriteH);

        for (let attempt = 0; attempt < 12; attempt++) {
            const x = integer(left, right);
            const y = integer(top, bottom);
            const dist = Math.hypot(x - this.ship.position.x, y - this.ship.position.y);
            if (dist >= this.minDashDistance && dist <= this.maxDashDistance) {
                return { x, y };
            }
        }

        return {
            x: integer(left, right),
            y: integer(top, bottom)
        };
    }
}
