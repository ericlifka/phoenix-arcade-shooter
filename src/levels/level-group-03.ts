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
import { bossMoneyPositions, moneyDropCount } from '../balance/economy.js';
import { group03 } from '../balance/group-03.js';
import { sample } from '../helpers/random.js';
import WatchForDeath from '../scripts/watch-for-death.js';
import type { GameForLevels } from '../types/levels.js';

type EnemyShipLike = EnemyShip | BossShip;
type OrbitSide = 'left' | 'right';

function orbitCenter(orbit: OrbitSide): { x: number; y: number } {
    return orbit === 'left' ? group03.leftOrbit : group03.rightOrbit;
}

/** Center-column ships join on the inner side of the main ring (toward screen center). */
function centerOrbitEntryPoint(orbit: OrbitSide): { x: number; y: number } {
    const center = orbitCenter(orbit);
    return orbit === 'left'
        ? { x: center.x + group03.orbitRadius, y: center.y }
        : { x: center.x - group03.orbitRadius, y: center.y };
}

/** Outer-column ships join on the outer side of the middle ring (toward screen edge). */
function outerOrbitEntryPoint(orbit: OrbitSide): { x: number; y: number } {
    const center = orbitCenter(orbit);
    return orbit === 'left'
        ? { x: center.x - group03.innerOrbitRadius, y: center.y }
        : { x: center.x + group03.innerOrbitRadius, y: center.y };
}

/** Inner-column ships join on the inner side of the innermost ring (toward screen center). */
function innermostOrbitEntryPoint(orbit: OrbitSide): { x: number; y: number } {
    const center = orbitCenter(orbit);
    return orbit === 'left'
        ? { x: center.x + group03.innermostOrbitRadius, y: center.y }
        : { x: center.x - group03.innermostOrbitRadius, y: center.y };
}

/**
 * Level group 03 — dual orbits with concentric rings unlocking outward.
 * rowCount 1: innermost ring only.
 * rowCount >= 2: + middle ring (opposite rotation from outer).
 * rowCount >= 3: + outermost ring via center-line procession.
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
            this.scripts.push(new Banner(this, this.levelName, group03.bannerMs));
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
        // Tier 1+: innermost ring
        this.spawnInnermostProcession('left');
        this.spawnInnermostProcession('right');

        // Tier 2+: middle ring
        if (this.rowCount >= 2) {
            this.spawnOuterProcession('left');
            this.spawnOuterProcession('right');
        }

        // Tier 3+: outermost ring (center-line procession)
        if (this.rowCount >= 3) {
            for (let i = 0; i < group03.centerProcessionShipCount; i++) {
                const orbit = i % 2 === 0 ? 'left' : 'right';
                this.spawnCenterProcessionShip(i, orbit);
            }
        }

        this.attachMoneyScripts();
    }

    private spawnCenterProcessionShip(index: number, orbit: OrbitSide): void {
        const orbitCenterPoint = orbitCenter(orbit);
        const entryPoint = centerOrbitEntryPoint(orbit);
        const staggerSeconds = index * group03.staggerSeconds;
        const pathSeconds = staggerSeconds + group03.descentSeconds;
        const needsPeel = entryPoint.x !== group03.centerX || entryPoint.y !== group03.splitY;

        this.spawnProcessionShip({
            descentX: group03.centerX,
            staggerSeconds,
            fireDelayMs: (pathSeconds - group03.fireDelaySlackSeconds) * 1000,
            entryPoint,
            orbitCenter: orbitCenterPoint,
            orbitRadius: group03.orbitRadius,
            clockwise: orbit === 'left',
            needsPeel
        });
    }

    private spawnOuterProcession(orbit: OrbitSide): void {
        const columnX = outerOrbitEntryPoint(orbit).x;

        for (let i = 0; i < group03.outerProcessionShipCount; i++) {
            const staggerSeconds = i * 2 * group03.staggerSeconds;
            const pathSeconds = staggerSeconds + group03.descentSeconds + group03.peelSeconds;

            this.spawnProcessionShip({
                descentX: columnX,
                staggerSeconds,
                fireDelayMs: (pathSeconds - group03.fireDelaySlackSeconds) * 1000,
                entryPoint: outerOrbitEntryPoint(orbit),
                orbitCenter: orbitCenter(orbit),
                orbitRadius: group03.innerOrbitRadius,
                // Opposite direction from the main (outer) ring on each side
                clockwise: orbit === 'right',
                needsPeel: true
            });
        }
    }

    private spawnInnermostProcession(orbit: OrbitSide): void {
        const entryPoint = innermostOrbitEntryPoint(orbit);
        const columnX = entryPoint.x;

        for (let i = 0; i < group03.innermostProcessionShipCount; i++) {
            const staggerSeconds = i * 2 * group03.staggerSeconds;
            const pathSeconds = staggerSeconds + group03.descentSeconds;

            this.spawnProcessionShip({
                descentX: columnX,
                staggerSeconds,
                fireDelayMs: (pathSeconds - group03.fireDelaySlackSeconds) * 1000,
                entryPoint,
                orbitCenter: orbitCenter(orbit),
                orbitRadius: group03.innermostOrbitRadius,
                // Same direction as the main (outer) ring on each side
                clockwise: orbit === 'left',
                needsPeel: entryPoint.x !== columnX || entryPoint.y !== group03.splitY
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
            new MoveObjectToPoint(null, ship, { x: descentX, y: group03.splitY }, group03.descentSeconds)
        );

        if (needsPeel) {
            steps.push(new MoveObjectToPoint(null, ship, entryPoint, group03.peelSeconds));
        }

        steps.push(new MoveObjectInCircle(null, ship, {
            center: orbitCenterPoint,
            radius: orbitRadius,
            period: group03.orbitPeriodSeconds,
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
            ? { x: center.x - group03.bossOrbitRadius, y: center.y }
            : { x: center.x + group03.bossOrbitRadius, y: center.y };
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
            new MoveObjectToPoint(null, boss, entryPoint, group03.bossEnterSeconds),
            new MoveObjectInCircle(null, boss, {
                center,
                radius: group03.bossOrbitRadius,
                period: group03.bossOrbitPeriodSeconds,
                // Opposite direction from the main enemy ring on each side
                clockwise: orbit === 'right'
            })
        ]) as any);

        this.scripts.push(new WatchForDeath(this, boss, () => {
            bossMoneyPositions(boss.position!).forEach((pos) => {
                this.addChild(new MoneyDrop(this, pos));
            });
        }));

        this.ships.push(boss);
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
