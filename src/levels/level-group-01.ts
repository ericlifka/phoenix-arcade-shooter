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
import { sample } from '../helpers/random.js';
import WatchForDeath from '../scripts/watch-for-death.js';
import type { GameForLevels } from '../types/levels.js';

export default class LevelGroup01 extends GameObject {
    alternateShip: boolean;
    difficultyMultiplier: number;
    width: number;
    height: number;
    boss?: boolean;
    game: GameForLevels;
    levelName?: string;
    rowCount: number;

    ships!: (EnemyShip | BossShip)[];
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
        this.rowCount = rowCount;

        this.reset();
    }

    start(): void {
        this.ships = [];
        this.scripts = [];

        let start = 4 - this.difficultyMultiplier;
        start = start < 1 ? 1 : start;
        let end = 7 + this.difficultyMultiplier;
        end = end > 10 ? 10 : end;

        for (let i = start; i <= end; i++) {
            this.newShip(10 * i + 39, -40, 45, 3);

            if (this.rowCount >= 2) {
                this.newShip(10 * i + 39, -30, 55, 3);
            }

            if (this.rowCount >= 3) {
                this.newShip(10 * i + 39, -20, 65, 3);
            }

            if (this.rowCount >= 4) {
                this.newShip(10 * i + 39, -10, 75, 3);
            }
        }

        this.attachMoneyScripts();

        if (this.boss) {
            this.newBossShip();
        }

        if (this.levelName) {
            this.scripts.push(new Banner(this, this.levelName, 2000));
        }

        this.ships.forEach(function (this: LevelGroup01, ship: EnemyShip | BossShip) {
            this.addChild(ship);
        }.bind(this));

        this.scripts.forEach(function (this: LevelGroup01, script: GameObject) {
            (script as GameObject & { start(): void }).start();
            this.addChild(script);
        }.bind(this));
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

    newShip(startX: number, startY: number, endY: number, time: number): void {
        const ship = new EnemyShip(this, this.difficultyMultiplier, this.alternateShip);

        ship.position!.x = startX;
        ship.position!.y = startY;

        this.scripts.push(new FireSingleGunRandomRate(this, ship));
        this.scripts.push(new ScriptChain(this, false, [
            new MoveObjectToPoint(null, ship, { x: startX, y: endY }, time * 2),
            new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY }, time),
            new ScriptChain(this, true, [
                new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY - 30 }, time),
                new MoveObjectToPoint(null, ship, { x: startX + 40, y: endY - 30 }, time * 2),
                new MoveObjectToPoint(null, ship, { x: startX + 40, y: endY }, time),
                new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY }, time * 2)
            ]) as any
        ]) as any);

        this.ships.push(ship);
    }

    newBossShip(): void {
        const boss = new BossShip(this, this.difficultyMultiplier);
        (window as unknown as { boss: BossShip }).boss = boss;
        const gameWidth = this.game.width;
        const bossWidth = boss.sprite.width;

        boss.position!.x = -this.game.width / 2;
        boss.position!.y = 1;

        boss.addChild(new LifeMeter(boss, {
            position: { x: 0, y: 0 },
            length: this.game.width,
            width: 1,
            horizontal: true
        }));

        this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 0 }));
        this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 2 }));
        this.scripts.push(new ChainGunFire(this, boss, { gunIndex: 1 }));

        this.scripts.push(new ScriptChain(this, true, [
            new MoveObjectToPoint(null, boss, { x: 1, y: 1 }, 8),
            new MoveObjectToPoint(null, boss, { x: gameWidth - bossWidth - 5, y: 1 }, 8)
        ]) as any);
        this.scripts.push(new WatchForDeath(this, boss, function (this: LevelGroup01) {
            const p = boss.position!;
            this.addChild(new MoneyDrop(this, {
                x: p.x,
                y: p.y
            }));
            this.addChild(new MoneyDrop(this, {
                x: p.x + 7,
                y: p.y
            }));
            this.addChild(new MoneyDrop(this, {
                x: p.x + 4,
                y: p.y + 8
            }));
        }.bind(this)));

        this.ships.push(boss);
    }

    attachMoneyScripts(): void {
        const divisor = this.difficultyMultiplier > 4 ? 2 : 3;
        const count = Math.floor(this.ships.length / divisor);
        const selectedShips = sample(this.ships, count);

        selectedShips.forEach(function (this: LevelGroup01, ship: EnemyShip | BossShip) {
            this.scripts.push(new WatchForDeath(this, ship, function (this: LevelGroup01) {
                this.addChild(new MoneyDrop(this, ship.position!));
            }.bind(this)));
        }.bind(this));
    }
}
