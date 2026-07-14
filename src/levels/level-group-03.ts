import Banner from '../components/fadeout-banner.js';
import BossShip from '../ships/arrow-boss.js';
import ChainGunFire from '../scripts/chain-gun-fire.js';
import EnemyShip from '../ships/arrow-ship.js';
import FireSingleGunRandomRate from '../scripts/fire-single-gun-random-rate.js';
import GameObject from '../models/game-object.js';
import LifeMeter from '../components/life-meter.js';
import MoneyDrop from '../components/money-drop.js';
import MoveObjectInCircle from '../scripts/move-object-in-circle.js';
import MoveObjectToPoint from '../scripts/move-object-to-point.js';
import ScriptChain from '../models/script-chain.js';
import Wait from '../scripts/wait.js';
import { sample } from '../helpers/random.js';
import WatchForDeath from '../scripts/watch-for-death.js';
import type { GameForLevels } from '../types/levels.js';

type EnemyShipLike = EnemyShip | BossShip;
type OrbitSide = 'left' | 'right';

const CENTER_X = 100;
const SPLIT_Y = 60;
const LEFT_ORBIT = { x: 55, y: 60 };
const RIGHT_ORBIT = { x: 145, y: 60 };
const ORBIT_RADIUS = 45;
/** Tighter ring used by outer-column ships (rowCount >= 2). */
const INNER_ORBIT_RADIUS = 33;
/** Innermost ring used by inner-column ships (rowCount >= 3). */
const INNERMOST_ORBIT_RADIUS = 21;
const STAGGER_SECONDS = 0.5;
const DESCENT_SECONDS = 3;
const PEEL_SECONDS = 2;
const ORBIT_PERIOD_SECONDS = 8;
const CENTER_PROCESSION_SHIP_COUNT = 16;
const OUTER_PROCESSION_SHIP_COUNT = 8;
const INNERMOST_PROCESSION_SHIP_COUNT = 8;
const BOSS_ORBIT_RADIUS = 26;
const BOSS_ENTER_SECONDS = 3;
const BOSS_ORBIT_PERIOD_SECONDS = 5;

function orbitCenter(orbit: OrbitSide): { x: number; y: number } {
    return orbit === 'left' ? LEFT_ORBIT : RIGHT_ORBIT;
}

/** Center-column ships join on the inner side of the main ring (toward screen center). */
function centerOrbitEntryPoint(orbit: OrbitSide): { x: number; y: number } {
    const center = orbitCenter(orbit);
    return orbit === 'left'
        ? { x: center.x + ORBIT_RADIUS, y: center.y }
        : { x: center.x - ORBIT_RADIUS, y: center.y };
}

/** Outer-column ships join on the outer side of the middle ring (toward screen edge). */
function outerOrbitEntryPoint(orbit: OrbitSide): { x: number; y: number } {
    const center = orbitCenter(orbit);
    return orbit === 'left'
        ? { x: center.x - INNER_ORBIT_RADIUS, y: center.y }
        : { x: center.x + INNER_ORBIT_RADIUS, y: center.y };
}

/** Inner-column ships join on the inner side of the innermost ring (toward screen center). */
function innermostOrbitEntryPoint(orbit: OrbitSide): { x: number; y: number } {
    const center = orbitCenter(orbit);
    return orbit === 'left'
        ? { x: center.x + INNERMOST_ORBIT_RADIUS, y: center.y }
        : { x: center.x - INNERMOST_ORBIT_RADIUS, y: center.y };
}

/**
 * Level group 03 — procession down the center line, then split into two orbits.
 * rowCount >= 2: outer columns + middle ring (opposite rotation from main).
 * rowCount >= 3: inner columns + innermost ring (same rotation as main).
 */
export default class LevelGroup03 extends GameObject {
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

    private spawnWave(): void {
        for (let i = 0; i < CENTER_PROCESSION_SHIP_COUNT; i++) {
            const orbit = i % 2 === 0 ? 'left' : 'right';
            this.spawnCenterProcessionShip(i, orbit);
        }

        if (this.rowCount >= 2) {
            this.spawnOuterProcession('left');
            this.spawnOuterProcession('right');
        }

        if (this.rowCount >= 3) {
            this.spawnInnermostProcession('left');
            this.spawnInnermostProcession('right');
        }

        this.attachMoneyScripts();
    }

    private spawnCenterProcessionShip(index: number, orbit: OrbitSide): void {
        const orbitCenterPoint = orbitCenter(orbit);
        const entryPoint = centerOrbitEntryPoint(orbit);
        const staggerSeconds = index * STAGGER_SECONDS;
        const pathSeconds = staggerSeconds + DESCENT_SECONDS;
        const needsPeel = entryPoint.x !== CENTER_X || entryPoint.y !== SPLIT_Y;

        this.spawnProcessionShip({
            descentX: CENTER_X,
            staggerSeconds,
            fireDelayMs: (pathSeconds - 2) * 1000,
            entryPoint,
            orbitCenter: orbitCenterPoint,
            orbitRadius: ORBIT_RADIUS,
            clockwise: orbit === 'left',
            needsPeel
        });
    }

    private spawnOuterProcession(orbit: OrbitSide): void {
        const columnX = outerOrbitEntryPoint(orbit).x;

        for (let i = 0; i < OUTER_PROCESSION_SHIP_COUNT; i++) {
            const staggerSeconds = i * 2 * STAGGER_SECONDS;
            const pathSeconds = staggerSeconds + DESCENT_SECONDS + PEEL_SECONDS;

            this.spawnProcessionShip({
                descentX: columnX,
                staggerSeconds,
                fireDelayMs: (pathSeconds - 2) * 1000,
                entryPoint: outerOrbitEntryPoint(orbit),
                orbitCenter: orbitCenter(orbit),
                orbitRadius: INNER_ORBIT_RADIUS,
                // Opposite direction from the main (outer) ring on each side
                clockwise: orbit === 'right',
                needsPeel: true
            });
        }
    }

    private spawnInnermostProcession(orbit: OrbitSide): void {
        const entryPoint = innermostOrbitEntryPoint(orbit);
        const columnX = entryPoint.x;

        for (let i = 0; i < INNERMOST_PROCESSION_SHIP_COUNT; i++) {
            const staggerSeconds = i * 2 * STAGGER_SECONDS;
            const pathSeconds = staggerSeconds + DESCENT_SECONDS;

            this.spawnProcessionShip({
                descentX: columnX,
                staggerSeconds,
                fireDelayMs: (pathSeconds - 2) * 1000,
                entryPoint,
                orbitCenter: orbitCenter(orbit),
                orbitRadius: INNERMOST_ORBIT_RADIUS,
                // Same direction as the main (outer) ring on each side
                clockwise: orbit === 'left',
                needsPeel: entryPoint.x !== columnX || entryPoint.y !== SPLIT_Y
            });
        }
    }

    private spawnProcessionShip(options: {
        descentX: number;
        staggerSeconds: number;
        fireDelayMs: number;
        entryPoint: { x: number; y: number };
        orbitCenter: { x: number; y: number };
        orbitRadius: number;
        clockwise: boolean;
        needsPeel: boolean;
    }): void {
        const ship = new EnemyShip(this, this.difficultyMultiplier, this.alternateShip);

        ship.position!.x = options.descentX;
        ship.position!.y = -20;

        this.scripts.push(new FireSingleGunRandomRate(this, ship, {
            initialDelayMs: options.fireDelayMs
        }));
        this.scripts.push(new ScriptChain(this, false, this.buildShipPath(
            ship,
            options.staggerSeconds,
            options.descentX,
            options.entryPoint,
            options.orbitCenter,
            options.orbitRadius,
            options.clockwise,
            options.needsPeel
        )) as any);

        this.ships.push(ship);
    }

    private buildShipPath(
        ship: EnemyShip,
        staggerSeconds: number,
        descentX: number,
        entryPoint: { x: number; y: number },
        orbitCenterPoint: { x: number; y: number },
        orbitRadius: number,
        clockwise: boolean,
        needsPeel: boolean
    ): GameObject[] {
        const steps: GameObject[] = [];

        if (staggerSeconds > 0) {
            steps.push(new Wait(null, staggerSeconds));
        }

        steps.push(
            new MoveObjectToPoint(null, ship, { x: descentX, y: SPLIT_Y }, DESCENT_SECONDS)
        );

        if (needsPeel) {
            steps.push(new MoveObjectToPoint(null, ship, entryPoint, PEEL_SECONDS));
        }

        steps.push(new MoveObjectInCircle(null, ship, {
            center: orbitCenterPoint,
            radius: orbitRadius,
            period: ORBIT_PERIOD_SECONDS,
            clockwise
        }));

        return steps;
    }

    private spawnBoss(): void {
        this.spawnOrbitingBoss('left');
        this.spawnOrbitingBoss('right');
    }

    private spawnOrbitingBoss(orbit: OrbitSide): void {
        const center = orbitCenter(orbit);
        const entryPoint = orbit === 'left'
            ? { x: center.x - BOSS_ORBIT_RADIUS, y: center.y }
            : { x: center.x + BOSS_ORBIT_RADIUS, y: center.y };
        const startX = orbit === 'left' ? -40 : this.game.width + 20;

        const boss = new BossShip(this, this.difficultyMultiplier);
        boss.enableOrbitPathAlignment();
        const offset = boss.orbitPathOffset!;
        boss.position!.x = startX + offset.x;
        boss.position!.y = center.y + offset.y;

        const halfWidth = Math.floor(this.game.width / 2);
        boss.addChild(new LifeMeter(boss, {
            position: { x: 0, y: 0 },
            anchor: orbit === 'left'
                ? { left: 0, top: 0 }
                : { left: halfWidth, top: 0 },
            length: halfWidth,
            width: 1,
            horizontal: true,
            // Left bar depletes rightward so both bars shrink toward screen center.
            mirror: orbit === 'left'
        }));

        this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 0 }));
        this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 2 }));
        this.scripts.push(new ChainGunFire(this, boss, { gunIndex: 1 }));

        this.scripts.push(new ScriptChain(this, false, [
            new MoveObjectToPoint(null, boss, entryPoint, BOSS_ENTER_SECONDS),
            new MoveObjectInCircle(null, boss, {
                center,
                radius: BOSS_ORBIT_RADIUS,
                period: BOSS_ORBIT_PERIOD_SECONDS,
                // Opposite direction from the main enemy ring on each side
                clockwise: orbit === 'right'
            })
        ]) as any);

        this.scripts.push(new WatchForDeath(this, boss, () => {
            const p = boss.position!;
            this.addChild(new MoneyDrop(this, { x: p.x, y: p.y }));
            this.addChild(new MoneyDrop(this, { x: p.x + 7, y: p.y }));
            this.addChild(new MoneyDrop(this, { x: p.x + 4, y: p.y + 8 }));
        }));

        this.ships.push(boss);
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
