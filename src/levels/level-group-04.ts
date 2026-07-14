import Banner from '../components/fadeout-banner.js';
import DashBoss from '../ships/dash-boss.js';
import DashShip from '../ships/dash-ship.js';
import DashAndPause from '../scripts/dash-and-pause.js';
import FireBurstOnPause from '../scripts/fire-burst-on-pause.js';
import GameObject from '../models/game-object.js';
import LifeMeter from '../components/life-meter.js';
import MoneyDrop from '../components/money-drop.js';
import { integer, sample } from '../helpers/random.js';
import WatchForDeath from '../scripts/watch-for-death.js';
import type { GameForLevels } from '../types/levels.js';

type DashShipLike = DashShip | DashBoss;

/**
 * Level group 04 — Dash-and-pause scouts.
 *
 * Plan (v0 scaffold):
 * - Ships enter staggered onto the mid-field and loop DashAndPause forever.
 * - During each pause they fire a short burst (FireBurstOnPause).
 * - rowCount increases ship count / density (tune later).
 * - Boss stage: same movement model, tougher DashBoss with multi-gun bursts + life meter.
 *
 * Distinct from groups 1–3: no fixed ScriptChain path — movement is procedural
 * (random waypoints within bounds), with telegraphable pause windows for the player.
 */
export default class LevelGroup04 extends GameObject {
    difficultyMultiplier: number;
    width: number;
    height: number;
    boss?: boolean;
    game: GameForLevels;
    levelName?: string;
    rowCount: number;

    ships!: DashShipLike[];
    scripts!: GameObject[];

    constructor(
        parent: GameObject | null | undefined,
        game: GameForLevels,
        difficultyMultiplier: number,
        _unusedAlternate: boolean,
        rowCount: number | 'boss',
        levelName?: string
    ) {
        super(parent);

        this.difficultyMultiplier = difficultyMultiplier;
        this.width = (this.parent as GameObject & { width: number }).width;
        this.height = (this.parent as GameObject & { height: number }).height;

        if (rowCount === 'boss') {
            rowCount = 1;
            this.boss = true;
        }

        this.game = game;
        this.levelName = levelName;
        this.rowCount = typeof rowCount === 'number' ? rowCount : 1;

        this.reset();
    }

    start(): void {
        this.ships = [];
        this.scripts = [];

        this.spawnWave();

        if (this.boss) {
            this.spawnBoss();
        }

        if (this.levelName) {
            this.scripts.push(new Banner(this, this.levelName, 2000));
        }

        this.ships.forEach((ship) => this.addChild(ship));
        this.scripts.forEach((script) => {
            (script as GameObject & { start(): void }).start();
            this.addChild(script);
        });
    }

    checkIfLevelComplete(): boolean {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (child && child.position && !child.destroyed) {
                return false;
            }
        }
        return true;
    }

    private playBounds() {
        return {
            left: 8,
            right: this.game.width - 8,
            top: 12,
            bottom: Math.floor(this.game.height * 0.55)
        };
    }

    /** Longer entry delay on the set opener so the player can finish flying in. */
    private entryWaitOptions(): { initialWaitSecondsMin: number; initialWaitSecondsMax: number } {
        if (this.levelName) {
            return { initialWaitSecondsMin: 1, initialWaitSecondsMax: 10 };
        }
        return { initialWaitSecondsMin: 0.5, initialWaitSecondsMax: 5 };
    }

    private spawnWave(): void {
        const count = 4 + this.rowCount * 3;
        const bounds = this.playBounds();
        const entryWait = this.entryWaitOptions();

        for (let i = 0; i < count; i++) {
            const ship = new DashShip(this, this.difficultyMultiplier);
            // Staggered start positions across the upper playfield
            ship.position.x = 20 + ((i * 37) % Math.max(1, bounds.right - 40));
            ship.position.y = -20 - (i % 5) * 12;

            this.scripts.push(new DashAndPause(this, ship, {
                bounds,
                dashSpeed: 130,
                pauseSecondsMin: 0.55,
                pauseSecondsMax: 1.2,
                minDashDistance: 28,
                maxDashDistance: 75,
                ...entryWait
            }));
            this.scripts.push(new FireBurstOnPause(this, ship, {
                burstSize: integer(1, this.rowCount + 3),
                fireRateMs: 110
            }));

            this.ships.push(ship);
        }

        this.attachMoneyScripts();
    }

    private spawnBoss(): void {
        const bounds = this.playBounds();
        const entryWait = this.entryWaitOptions();
        const boss = new DashBoss(this, this.difficultyMultiplier);
        boss.position.x = Math.floor(this.game.width / 2) - 7;
        boss.position.y = -30;

        boss.addChild(new LifeMeter(boss, {
            position: { x: 0, y: 0 },
            length: this.game.width,
            width: 1,
            horizontal: true
        }));

        this.scripts.push(new DashAndPause(this, boss, {
            bounds: { ...bounds, bottom: Math.floor(this.game.height * 0.45) },
            dashSpeed: 95,
            pauseSecondsMin: 0.8,
            pauseSecondsMax: 1.6,
            minDashDistance: 35,
            maxDashDistance: 90,
            ...entryWait
        }));
        this.scripts.push(new FireBurstOnPause(this, boss, { gunIndex: 0, burstSize: 4, fireRateMs: 90 }));
        this.scripts.push(new FireBurstOnPause(this, boss, { gunIndex: 1, burstSize: 5, fireRateMs: 70, windupMs: 40 }));
        this.scripts.push(new FireBurstOnPause(this, boss, { gunIndex: 2, burstSize: 4, fireRateMs: 90 }));

        this.scripts.push(new WatchForDeath(this, boss, () => {
            const p = boss.position;
            this.addChild(new MoneyDrop(this, { x: p.x, y: p.y }));
            this.addChild(new MoneyDrop(this, { x: p.x + 7, y: p.y }));
            this.addChild(new MoneyDrop(this, { x: p.x + 4, y: p.y + 8 }));
        }));

        this.ships.push(boss);
    }

    private attachMoneyScripts(): void {
        const divisor = this.difficultyMultiplier > 4 ? 2 : 3;
        const count = Math.floor(this.ships.length / divisor);
        if (count < 1) return;

        sample(this.ships, count).forEach((ship) => {
            this.scripts.push(new WatchForDeath(this, ship, () => {
                const pos = ship.position;
                this.addChild(new MoneyDrop(this, { x: pos.x, y: pos.y }));
            }));
        });
    }
}
