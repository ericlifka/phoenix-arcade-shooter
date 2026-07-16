import Banner from '../components/fadeout-banner.js';
import BossShip from '../ships/arrow-boss.js';
import ChainGunFire from '../scripts/chain-gun-fire.js';
import EnemyShip from '../ships/arrow-ship.js';
import FireSingleGunRandomRate from '../scripts/fire-single-gun-random-rate.js';
import GameObject from '../models/game-object.js';
import LifeMeter from '../components/life-meter.js';
import MoneyDrop from '../components/money-drop.js';
import MoveObjectToPoint from '../scripts/move-object-to-point.js';
import ScriptChain from '../models/script-chain.js';
import Wait from '../scripts/wait.js';
import { bossMoneyPositions, moneyDropCount } from '../balance/economy.js';
import { group02, group02LaneCount, group02ShipCount } from '../balance/group-02.js';
import { sample } from '../helpers/random.js';
import WatchForDeath from '../scripts/watch-for-death.js';
import type { GameForLevels } from '../types/levels.js';
import type { Position } from '../types/rendering';

type EnemyShipLike = EnemyShip | BossShip;

/**
 * Level group 02 — a long line of enemies enters from the left and follows an
 * infinite serpentine path. Tunables live in src/balance/group-02.ts.
 */
export default class LevelGroup02 extends GameObject {
    alternateShip: boolean;
    difficultyMultiplier: number;
    width: number;
    height: number;
    boss?: boolean;
    game: GameForLevels;
    levelName?: string;
    rowCount: number;

    ships!: EnemyShipLike[];
    scripts!: GameObject[];

    constructor(
        parent: GameObject | null | undefined,
        game: GameForLevels,
        difficultyMultiplier: number,
        alternateShip: boolean,
        rowCount: number | 'boss',
        levelName?: string
    ) {
        super(parent);

        this.alternateShip = alternateShip;
        this.difficultyMultiplier = difficultyMultiplier;
        this.width = (this.parent as GameObject & { width: number }).width;
        this.height = (this.parent as GameObject & { height: number }).height;

        if (rowCount === 'boss') {
            rowCount = 1;
            this.boss = true;
        }

        this.game = game;
        this.levelName = levelName;
        this.rowCount = rowCount === 'boss' ? 1 : rowCount;

        this.reset();
    }

    start(): void {
        this.ships = [];
        this.scripts = [];

        const shipCount = this.spawnParade();

        if (this.boss) {
            this.spawnBoss(shipCount * group02.staggerSeconds);
        }

        if (this.levelName) {
            this.scripts.push(new Banner(this, this.levelName, group02.bannerMs));
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

    private spawnParade(): number {
        const laneYs = this.laneYs();
        const destinations = serpentineDestinations(laneYs);
        const shipCount = group02ShipCount(this.rowCount);

        for (let i = 0; i < shipCount; i++) {
            this.spawnShip(i * group02.staggerSeconds, destinations, group02.pathSpeed);
        }

        this.attachMoneyScripts();
        return shipCount;
    }

    private spawnShip(delaySeconds: number, destinations: Position[], speed: number): void {
        const ship = new EnemyShip(this, this.difficultyMultiplier, this.alternateShip);
        ship.position!.x = group02.enterX;
        ship.position!.y = destinations[0].y;

        this.scripts.push(new FireSingleGunRandomRate(this, ship, {
            initialDelayMs: (delaySeconds + group02.fireDelayPaddingSeconds) * 1000
        }));
        this.scripts.push(buildSerpentineScripts(this, ship, destinations, speed, delaySeconds));
        this.ships.push(ship);
    }

    private spawnBoss(delaySeconds: number): void {
        const destinations = serpentineDestinations(this.laneYs());
        const boss = new BossShip(this, this.difficultyMultiplier);
        boss.position!.x = group02.enterX;
        boss.position!.y = destinations[0].y;

        boss.addChild(new LifeMeter(boss, {
            position: { x: 0, y: 0 },
            length: this.game.width,
            width: 1,
            horizontal: true
        }));

        const fireDelayMs = (delaySeconds + group02.fireDelayPaddingSeconds) * 1000;
        this.scripts.push(new FireSingleGunRandomRate(this, boss, {
            gunIndex: 0,
            initialDelayMs: 0
        }));
        this.scripts.push(new FireSingleGunRandomRate(this, boss, {
            gunIndex: 2,
            initialDelayMs: 0
        }));
        this.scripts.push(new ChainGunFire(this, boss, { gunIndex: 1 }));
        this.scripts.push(buildSerpentineScripts(this, boss, destinations, group02.pathSpeed, delaySeconds));

        this.scripts.push(new WatchForDeath(this, boss, () => {
            bossMoneyPositions(boss.position!).forEach((pos) => {
                this.addChild(new MoneyDrop(this, pos));
            });
        }));

        this.ships.push(boss);
    }

    private laneYs(): number[] {
        const laneCount = group02LaneCount(this.rowCount);
        const lanes: number[] = [];
        for (let i = 0; i < laneCount; i++) {
            lanes.push(group02.pathTop + i * group02.laneGap);
        }
        return lanes;
    }

    private attachMoneyScripts(): void {
        const count = moneyDropCount(this.ships.length, this.difficultyMultiplier);
        const selectedShips = sample(this.ships, count);

        selectedShips.forEach((ship) => {
            this.scripts.push(new WatchForDeath(this, ship, () => {
                const pos = ship.position!;
                this.addChild(new MoneyDrop(this, { x: pos.x, y: pos.y }));
            }));
        });
    }
}

function serpentineDestinations(laneYs: number[]): Position[] {
    const points: Position[] = [{ x: group02.pathLeft, y: laneYs[0] }];

    for (let i = 0; i < laneYs.length; i++) {
        const y = laneYs[i];
        const goingRight = i % 2 === 0;
        const isLast = i === laneYs.length - 1;

        if (goingRight) {
            points.push({ x: group02.pathRight, y });
            if (!isLast) {
                points.push({ x: group02.pathRight, y: laneYs[i + 1] });
            }
        } else {
            const leftTarget = isLast ? group02.pathLeft : group02.pathInner;
            points.push({ x: leftTarget, y });
            if (!isLast) {
                points.push({ x: leftTarget, y: laneYs[i + 1] });
            }
        }
    }

    points.push({ x: group02.pathLeft, y: laneYs[0] });
    return points;
}

function travelTime(from: Position, to: Position, speed: number): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.hypot(dx, dy) / speed;
}

function buildSerpentineScripts(
    level: GameObject,
    ship: EnemyShipLike,
    destinations: Position[],
    speed: number,
    delaySeconds: number
): ScriptChain {
    const entry = destinations[0];
    const enterFrom = { x: ship.position!.x, y: ship.position!.y };

    const loopMoves: MoveObjectToPoint[] = [];
    for (let i = 1; i < destinations.length; i++) {
        const from = destinations[i - 1];
        const to = destinations[i];
        loopMoves.push(new MoveObjectToPoint(null, ship, to, travelTime(from, to, speed)));
    }

    return new ScriptChain(level, false, [
        new Wait(null, delaySeconds),
        new MoveObjectToPoint(null, ship, entry, travelTime(enterFrom, entry, speed)),
        new ScriptChain(level, true, loopMoves as any)
    ] as any);
}
