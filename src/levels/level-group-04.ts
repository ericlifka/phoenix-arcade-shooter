import Banner from '../components/fadeout-banner.js';
import DashBoss from '../ships/dash-boss.js';
import DashShip from '../ships/dash-ship.js';
import DashAndPause from '../scripts/dash-and-pause.js';
import FireBurstOnPause from '../scripts/fire-burst-on-pause.js';
import GameObject from '../models/game-object.js';
import LifeMeter from '../components/life-meter.js';
import MoneyDrop from '../components/money-drop.js';
import { bossMoneyPositions, moneyDropCount } from '../balance/economy.js';
import { group04, group04ShipCount } from '../balance/group-04.js';
import { integer, sample } from '../helpers/random.js';
import WatchForDeath from '../scripts/watch-for-death.js';
import type { GameForLevels } from '../types/levels.js';

type DashShipLike = DashShip | DashBoss;

/**
 * Level group 04 — dash-and-pause scouts.
 * Tunables live in src/balance/group-04.ts.
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
            this.scripts.push(new Banner(this, this.levelName, group04.bannerMs));
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
            left: group04.boundsLeft,
            right: this.game.width - group04.boundsRightInset,
            top: group04.boundsTop,
            bottom: Math.floor(this.game.height * group04.boundsBottomFraction)
        };
    }

    private entryWaitOptions(): { initialWaitSecondsMin: number; initialWaitSecondsMax: number } {
        if (this.levelName) {
            return {
                initialWaitSecondsMin: group04.entryWaitOpenerMin,
                initialWaitSecondsMax: group04.entryWaitOpenerMax
            };
        }
        return {
            initialWaitSecondsMin: group04.entryWaitFollowUpMin,
            initialWaitSecondsMax: group04.entryWaitFollowUpMax
        };
    }

    private spawnWave(): void {
        const count = group04ShipCount(this.rowCount);
        const bounds = this.playBounds();
        const entryWait = this.entryWaitOptions();
        const scout = group04.scout;

        for (let i = 0; i < count; i++) {
            const ship = new DashShip(this, this.difficultyMultiplier);
            ship.position.x = 20 + ((i * 37) % Math.max(1, bounds.right - 40));
            ship.position.y = -20 - (i % 5) * 12;

            this.scripts.push(new DashAndPause(this, ship, {
                bounds,
                dashSpeed: scout.dashSpeed,
                pauseSecondsMin: scout.pauseSecondsMin,
                pauseSecondsMax: scout.pauseSecondsMax,
                minDashDistance: scout.minDashDistance,
                maxDashDistance: scout.maxDashDistance,
                ...entryWait
            }));
            this.scripts.push(new FireBurstOnPause(this, ship, {
                burstSize: integer(1, this.rowCount + scout.burstSizeRowBonus),
                fireRateMs: scout.burstFireRateMs
            }));

            this.ships.push(ship);
        }

        this.attachMoneyScripts();
    }

    private spawnBoss(): void {
        const bounds = this.playBounds();
        const entryWait = this.entryWaitOptions();
        const bossTuning = group04.boss;
        const boss = new DashBoss(this, this.difficultyMultiplier);
        boss.position.x = Math.floor(this.game.width / 2) - 7;
        boss.position.y = bossTuning.spawnY;

        boss.addChild(new LifeMeter(boss, {
            position: { x: 0, y: 0 },
            length: this.game.width,
            width: 1,
            horizontal: true
        }));

        this.scripts.push(new DashAndPause(this, boss, {
            bounds: {
                ...bounds,
                bottom: Math.floor(this.game.height * group04.bossBoundsBottomFraction)
            },
            dashSpeed: bossTuning.dashSpeed,
            pauseSecondsMin: bossTuning.pauseSecondsMin,
            pauseSecondsMax: bossTuning.pauseSecondsMax,
            minDashDistance: bossTuning.minDashDistance,
            maxDashDistance: bossTuning.maxDashDistance,
            ...entryWait
        }));

        for (const burst of bossTuning.bursts) {
            this.scripts.push(new FireBurstOnPause(this, boss, { ...burst }));
        }

        this.scripts.push(new WatchForDeath(this, boss, () => {
            bossMoneyPositions(boss.position).forEach((pos) => {
                this.addChild(new MoneyDrop(this, pos));
            });
        }));

        this.ships.push(boss);
    }

    private attachMoneyScripts(): void {
        const count = moneyDropCount(this.ships.length, this.difficultyMultiplier);
        if (count < 1) return;

        sample(this.ships, count).forEach((ship) => {
            this.scripts.push(new WatchForDeath(this, ship, () => {
                const pos = ship.position;
                this.addChild(new MoneyDrop(this, { x: pos.x, y: pos.y }));
            }));
        });
    }
}
