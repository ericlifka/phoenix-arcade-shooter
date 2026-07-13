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
import { sample } from '../helpers/random.js';
import WatchForDeath from '../scripts/watch-for-death.js';
import type { GameForLevels } from '../types/levels.js';
import type { Position } from '../types/rendering';

type EnemyShipLike = EnemyShip | BossShip;

/** Left edge — upward return channel (`^`). */
const PATH_LEFT = 4;
/** Left edge of middle horizontal runs (leaves room for the return channel). */
const PATH_INNER = 20;
/** Right turnaround edge (`V`). */
const PATH_RIGHT = 182;
/** Top lane Y of the serpentine. */
const PATH_TOP = 4;
/** Vertical distance between horizontal lanes. */
const LANE_GAP = 14;
/** Pixels per second along the path. */
const PATH_SPEED = 40;
const ENTER_X = -24;
const STAGGER_SECONDS = 0.45;

/**
 * Level group 02 — a long line of enemies enters from the left and follows an
 * infinite serpentine path:
 *
 *   X>>>>>>>>>>>>V
 *   ^  V<<<<<<<<<<<
 *   ^  >>>>>>>>>>>V
 *   ^  V<<<<<<<<<<<
 *   ^  >>>>>>>>>>>V
 *   ^<<<<<<<<<<<<<
 *
 * rowCount grows the parade (more ships) and adds more horizontal lanes.
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
            // One stagger after the last parade ship so the boss is the tail of the line.
            this.spawnBoss(shipCount * STAGGER_SECONDS);
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

    private spawnParade(): number {
        const laneYs = this.laneYs();
        const destinations = serpentineDestinations(laneYs);
        const shipCount = 8 * (this.rowCount + 1); // counts: 16 -> 24 -> 32 -> 40

        for (let i = 0; i < shipCount; i++) {
            this.spawnShip(i * STAGGER_SECONDS, destinations, PATH_SPEED);
        }

        this.attachMoneyScripts();
        return shipCount;
    }

    private spawnShip(delaySeconds: number, destinations: Position[], speed: number): void {
        const ship = new EnemyShip(this, this.difficultyMultiplier, this.alternateShip);
        ship.position!.x = ENTER_X;
        ship.position!.y = destinations[0].y;

        this.scripts.push(new FireSingleGunRandomRate(this, ship, {
            initialDelayMs: (delaySeconds + 1.5) * 1000
        }));
        this.scripts.push(buildSerpentineScripts(this, ship, destinations, speed, delaySeconds));
        this.ships.push(ship);
    }

    private spawnBoss(delaySeconds: number): void {
        const destinations = serpentineDestinations(this.laneYs());
        const boss = new BossShip(this, this.difficultyMultiplier);
        boss.position!.x = ENTER_X;
        boss.position!.y = destinations[0].y;

        boss.addChild(new LifeMeter(boss, {
            position: { x: 0, y: 0 },
            length: this.game.width,
            width: 1,
            horizontal: true
        }));

        this.scripts.push(new FireSingleGunRandomRate(this, boss, {
            gunIndex: 0,
            initialDelayMs: (delaySeconds + 1.5) * 1000
        }));
        this.scripts.push(new FireSingleGunRandomRate(this, boss, {
            gunIndex: 2,
            initialDelayMs: (delaySeconds + 1.5) * 1000
        }));
        this.scripts.push(new ChainGunFire(this, boss, { gunIndex: 1 }));
        this.scripts.push(buildSerpentineScripts(this, boss, destinations, PATH_SPEED, delaySeconds));

        this.scripts.push(new WatchForDeath(this, boss, () => {
            const p = boss.position!;
            this.addChild(new MoneyDrop(this, { x: p.x, y: p.y }));
            this.addChild(new MoneyDrop(this, { x: p.x + 7, y: p.y }));
            this.addChild(new MoneyDrop(this, { x: p.x + 4, y: p.y + 8 }));
        }));

        this.ships.push(boss);
    }

    private laneYs(): number[] {
        // Even lane counts so the bottom run is always leftward into the return channel.
        const laneCount = Math.min(2 + this.rowCount * 2, 8);
        const lanes: number[] = [];
        for (let i = 0; i < laneCount; i++) {
            lanes.push(PATH_TOP + i * LANE_GAP);
        }
        return lanes;
    }

    private attachMoneyScripts(): void {
        const divisor = this.difficultyMultiplier > 4 ? 2 : 3;
        const count = Math.floor(this.ships.length / divisor);
        const selectedShips = sample(this.ships, count);

        selectedShips.forEach((ship) => {
            this.scripts.push(new WatchForDeath(this, ship, () => {
                const pos = ship.position!;
                this.addChild(new MoneyDrop(this, { x: pos.x, y: pos.y }));
            }));
        });
    }
}

/**
 * Destinations for one full serpentine lap, ending with the climb back to the top-left
 * so a repeating ScriptChain loops forever.
 */
function serpentineDestinations(laneYs: number[]): Position[] {
    const points: Position[] = [{ x: PATH_LEFT, y: laneYs[0] }];

    for (let i = 0; i < laneYs.length; i++) {
        const y = laneYs[i];
        const goingRight = i % 2 === 0;
        const isLast = i === laneYs.length - 1;

        if (goingRight) {
            points.push({ x: PATH_RIGHT, y });
            if (!isLast) {
                points.push({ x: PATH_RIGHT, y: laneYs[i + 1] });
            }
        } else {
            const leftTarget = isLast ? PATH_LEFT : PATH_INNER;
            points.push({ x: leftTarget, y });
            if (!isLast) {
                points.push({ x: leftTarget, y: laneYs[i + 1] });
            }
        }
    }

    // Climb the left return channel back to the top of the loop.
    points.push({ x: PATH_LEFT, y: laneYs[0] });
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
    // Enter from off-screen to the top-left path start, then loop the lap forever.
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
