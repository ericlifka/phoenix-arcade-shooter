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
import { bossMoneyPositions, moneyDropCount } from '../balance/economy.js';
import { group01, group01ColumnRange } from '../balance/group-01.js';
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

        const { start, end } = group01ColumnRange(this.difficultyMultiplier);
        const time = group01.moveTimeSeconds;

        for (let i = start; i <= end; i++) {
            const x = group01.columnSpacing * i + group01.columnOffsetX;

            this.newShip(x, group01.enterY[0], group01.restY[0], time);

            if (this.rowCount >= 2) {
                this.newShip(x, group01.enterY[1], group01.restY[1], time);
            }

            if (this.rowCount >= 3) {
                this.newShip(x, group01.enterY[2], group01.restY[2], time);
            }

            if (this.rowCount >= 4) {
                this.newShip(x, group01.enterY[3], group01.restY[3], time);
            }
        }

        this.attachMoneyScripts();

        if (this.boss) {
            this.newBossShip();
        }

        if (this.levelName) {
            this.scripts.push(new Banner(this, this.levelName, group01.bannerMs));
        }

        this.ships.forEach((ship: EnemyShip | BossShip) => {
            this.addChild(ship);
        });

        this.scripts.forEach((script: GameObject) => {
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

    newShip(startX: number, startY: number, endY: number, time: number): void {
        const ship = new EnemyShip(this, this.difficultyMultiplier, this.alternateShip);
        const swayX = group01.swayOffsetX;
        const swayY = group01.swayOffsetY;

        ship.position!.x = startX;
        ship.position!.y = startY;

        this.scripts.push(new FireSingleGunRandomRate(this, ship));
        this.scripts.push(new ScriptChain(this, false, [
            new MoveObjectToPoint(null, ship, { x: startX, y: endY }, time * 2),
            new MoveObjectToPoint(null, ship, { x: startX - swayX, y: endY }, time),
            new ScriptChain(this, true, [
                new MoveObjectToPoint(null, ship, { x: startX - swayX, y: endY - swayY }, time),
                new MoveObjectToPoint(null, ship, { x: startX + swayX, y: endY - swayY }, time * 2),
                new MoveObjectToPoint(null, ship, { x: startX + swayX, y: endY }, time),
                new MoveObjectToPoint(null, ship, { x: startX - swayX, y: endY }, time * 2)
            ]) as any
        ]) as any);

        this.ships.push(ship);
    }

    newBossShip(): void {
        const boss = new BossShip(this, this.difficultyMultiplier);
        const gameWidth = this.game.width;
        const bossWidth = boss.sprite.width;
        const patrolY = group01.bossPatrolY;
        const patrolSeconds = group01.bossPatrolSeconds;

        boss.position!.x = -this.game.width / 2;
        boss.position!.y = patrolY;

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
            new MoveObjectToPoint(null, boss, { x: group01.bossPatrolLeftX, y: patrolY }, patrolSeconds),
            new MoveObjectToPoint(null, boss, {
                x: gameWidth - bossWidth - group01.bossPatrolRightMargin,
                y: patrolY
            }, patrolSeconds)
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

        selectedShips.forEach((ship: EnemyShip | BossShip) => {
            this.scripts.push(new WatchForDeath(this, ship, () => {
                this.addChild(new MoneyDrop(this, ship.position!));
            }));
        });
    }
}
