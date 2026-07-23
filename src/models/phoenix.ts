import Bank from '../components/bank.js';
import Bomb from '../components/bomb.js';
import Bullet from '../components/bullet.js';
import collectEntities from '../helpers/collect-entities.js';
import { boxCollision, circleIntersectsBox, spriteCollision } from '../helpers/collisions.js';
import { applySave, captureSave, loadSave, writeSave } from '../helpers/game-save.js';
import ComboGauge from '../components/combo-gauge.js';
import ControlsScreen from '../screens/controls-description.js';
import EmbeddedTitleScreen from '../screens/slim-title-screen.js';
import EventedInput from './evented-input.js';
import GameObject from './game-object.js';
import GameOverScreen from '../screens/game-over-screen.js';
import InputInterpreter from '../helpers/input-interpreter.js';
import LevelManager from '../levels/level-manager.js';
import LifeMeter from '../components/life-meter.js';
import PlayerShip from '../ships/player-controlled-ship.js';
import RunStats from './run-stats.js';
import TextDisplay from '../components/text-display.js';
import { BombOptions, BulletOptions, GameOverResult, PhysicalEntity } from '../types/game';
import type { GameForLevels, GameForShop } from '../types/levels.js';

export interface PhoenixOptions {
    width: number;
    height: number;
}

export default class Phoenix extends GameObject implements GameForLevels, GameForShop {
    FILL_COLOR = '#000031';
    interfaceColor = '#ffd';

    width: number;
    height: number;

    titleScreen: EmbeddedTitleScreen;
    controlsScreen: ControlsScreen;
    gameOverScreen: GameOverScreen;
    player: PlayerShip;
    inputInterpreter: InputInterpreter;
    pauseInputTracker: EventedInput;
    pausedText: TextDisplay;
    comboGauge: ComboGauge;
    lifeMeter: LifeMeter;
    bank: Bank;
    levelManager: LevelManager;
    runStats: RunStats;

    gameOver = false;
    paused = false;
    runsCompleted = 0;
    gameOverCallback?: (result: GameOverResult) => void;
    activeBomb: Bomb | null = null;

    constructor(options: PhoenixOptions) {
        super(null);

        this.width = options.width;
        this.height = options.height;
        this.runStats = new RunStats();

        this.titleScreen = new EmbeddedTitleScreen(this);
        this.controlsScreen = new ControlsScreen(this);
        this.gameOverScreen = new GameOverScreen(this);
        this.player = new PlayerShip(this);
        this.inputInterpreter = new InputInterpreter();

        this.pauseInputTracker = new EventedInput({
            onStart: this.togglePause.bind(this)
        });

        this.pausedText = new TextDisplay(this, {
            font: 'arcade',
            message: 'PAUSE',
            color: 'yellow',
            position: { x: 82, y: 70 }
        });

        this.comboGauge = new ComboGauge(this, {
            position: { x: 1, y: 0 },
            anchorBottom: this.height - 7,
            color: this.interfaceColor,
            player: this.player
        });
        this.lifeMeter = new LifeMeter(this.player, {
            scale: 1,
            width: 4,
            anchor: { right: this.width - 1, bottom: this.height - 7 },
            showBorder: true,
            borderColor: this.interfaceColor
        });
        this.bank = new Bank(this, {
            position: { x: this.width, y: this.height - 6 },
            color: this.interfaceColor
        });

        this.levelManager = new LevelManager(this, this);

        this.reset();
    }

    reset(): void {
        super.reset();

        this.gameOver = false;
        this.paused = false;

        this.player.reset();

        const save = loadSave();
        if (save) {
            applySave(this, save);
        }

        this.titleScreen.reset(this.runsCompleted);
        this.gameOverScreen.reset();
        this.levelManager.reset();

        this.addChild(this.player);
        this.addChild(this.levelManager);
        this.addChild(this.titleScreen);
        this.addChild(this.pauseInputTracker as unknown as GameObject);
    }

    /** Snapshot hangar unlocks/ranks + runs completed to localStorage. */
    persistMeta(): void {
        writeSave(captureSave(this));
    }

    clearBullets(): void {
        this.children
            .filter(function (entity) {
                return entity.type === 'bullet';
            })
            .forEach(
                function (this: Phoenix, bullet: GameObject) {
                    this.removeChild(bullet);
                }.bind(this)
            );
    }

    clearBombs(): void {
        this.activeBomb = null;
        this.children
            .filter(function (entity) {
                return (entity as any).type === 'bomb';
            })
            .forEach(
                function (this: Phoenix, bomb: GameObject) {
                    this.removeChild(bomb);
                }.bind(this)
            );
    }

    startNewGame(): void {
        this.runStats.reset();
        this.bank.resetForRun();
        this.comboGauge.reset();
        this.player.resetForNewRun();
        this.levelManager.reset();
        this.clearBombs();

        this.lifeMeter.reset();

        this.addChild(this.bank);
        this.addChild(this.comboGauge);
        this.addChild(this.lifeMeter);

        this.levelManager.start();
    }

    finishGame(): void {
        this.runsCompleted++;
        this.persistMeta();

        if (this.gameOverCallback) {
            this.gameOverCallback({
                score: this.comboGauge.getScore(),
                level: this.levelManager.levelNameCounter
            });
            this.destroy();
        }
        else {
            this.returnToMenu();
        }
    }

    returnToMenu(): void {
        this.gameOver = false;
        this.paused = false;

        this.removeChild(this.gameOverScreen);
        this.removeChild(this.bank);
        this.removeChild(this.comboGauge);
        this.removeChild(this.lifeMeter);
        this.levelManager.stop();
        this.clearBullets();
        this.clearBombs();

        this.gameOverScreen.reset();
        this.titleScreen.reset(this.runsCompleted);

        if (!this.children.includes(this.player)) {
            this.addChild(this.player);
        }

        if (!this.children.includes(this.titleScreen)) {
            this.addChild(this.titleScreen);
        }

        this.player.resetForNewRun();
    }

    recordDollarsSpent(amount: number): void {
        this.runStats.dollarsSpent += amount;
    }

    showControlsScreen(): void {
        this.addChild(this.controlsScreen);
    }

    processInput(rawInput: Parameters<InputInterpreter['interpret']>[0]): void {
        super.processInput(this.inputInterpreter.interpret(rawInput));
    }

    update(dtime: number): void {
        if (!this.paused) {
            super.update(dtime);

            this.checkCollisions();
            this.checkGameOver();
        }
    }

    togglePause(): void {
        if (this.paused) {
            this.unpause();
        }
        else {
            this.pause();
        }
    }

    pause(): void {
        if (
            this.levelManager.running &&
            !this.paused &&
            !this.gameOver &&
            !this.levelManager.currentLevel!.isShop
        ) {
            this.paused = true;
            this.addChild(this.pausedText);
        }
    }

    unpause(): void {
        this.paused = false;
        this.removeChild(this.pausedText);
    }

    checkCollisions(): void {
        const physicalEntities = collectEntities(this, this.physicalEntityMatcher);
        const collisionPairs = this.findBoxCollisions(physicalEntities);
        this.checkPairsForCollision(collisionPairs);
    }

    physicalEntityMatcher(entity: PhysicalEntity): boolean {
        return !!(entity.isPhysicalEntity && !entity.exploding);
    }

    findBoxCollisions(entities: PhysicalEntity[]): PhysicalEntity[][] {
        const collisionPairs: PhysicalEntity[][] = [];

        for (let i = 0; i < entities.length - 1; i++) {
            const outer = entities[i];

            for (let j = i + 1; j < entities.length; j++) {
                const inner = entities[j];

                if (
                    (outer.type === 'pickup' || inner.type === 'pickup') &&
                    !(outer.type === 'player' || inner.type === 'player')
                ) {
                    continue;
                }

                if (outer.team !== inner.team && boxCollision(outer, inner)) {
                    collisionPairs.push([outer, inner]);
                }
            }
        }

        return collisionPairs;
    }

    checkPairsForCollision(pairs: PhysicalEntity[][]): void {
        pairs.forEach((pair) => {
            const a = pair[0];
            const b = pair[1];

            if (!spriteCollision(a, b)) {
                return;
            }

            if (a.type === 'bomb' || b.type === 'bomb') {
                const bomb = (a.type === 'bomb' ? a : b) as unknown as Bomb;
                const other = a.type === 'bomb' ? b : a;

                // Enemy bullets do not trigger detonation.
                if (other.type === 'bullet') {
                    return;
                }

                // Contact with an enemy ship detonates immediately.
                if (other.team !== 0 && other.type !== 'pickup') {
                    bomb.detonate();
                }
                return;
            }

            a.applyDamage(b.damage, b);
            b.applyDamage(a.damage, a);
        });
    }

    checkGameOver(): void {
        const gameResult = this.player.destroyed
            ? 'loss'
            : this.levelManager.complete
                ? 'win'
                : null;

        if (gameResult && !this.gameOver) {
            this.gameOver = true;
            this.runStats.pointsEarned = this.comboGauge.getScore();
            this.gameOverScreen.setResult(gameResult);
            this.gameOverScreen.setRunStats(this.runStats);

            this.removeChild(this.player);
            this.addChild(this.gameOverScreen);
        }
    }

    spawnBullet(data: BulletOptions): void {
        this.addChild(new Bullet(this, data));
    }

    spawnBomb(data: BombOptions): void {
        if (this.activeBomb && !this.activeBomb.destroyed && !this.activeBomb.exploding) {
            return;
        }

        const bomb = new Bomb(this, data);
        this.activeBomb = bomb;
        this.addChild(bomb);
    }

    detonateBomb(): void {
        if (this.activeBomb && !this.activeBomb.destroyed && !this.activeBomb.exploding) {
            this.activeBomb.detonate();
        }
    }

    bombCleared(bomb: Bomb): void {
        if (this.activeBomb === bomb) {
            this.activeBomb = null;
        }
    }

    applyBombBlast(data: {
        center: { x: number; y: number };
        radius: number;
        damage: number;
        source: Bomb;
    }): void {
        const entities = collectEntities(this, this.physicalEntityMatcher) as PhysicalEntity[];

        entities.forEach((entity) => {
            if (entity === data.source) {
                return;
            }
            if (circleIntersectsBox(data.center.x, data.center.y, data.radius, entity)) {
                entity.applyDamage(data.damage, data.source);
            }
        });
    }

    enemyDestroyed(data: { shipValue: number }): void {
        this.runStats.enemiesDestroyed++;
        this.comboGauge.addPoints(data.shipValue);
    }

    enemyHit(): void {
        this.comboGauge.bumpCombo();
    }

    playerHit(): void {
        this.comboGauge.clearCombo();
    }

    moneyCollected(value: number): void {
        const amount = value * this.comboGauge.getMultiplier();
        this.runStats.dollarsCollected += amount;
        this.bank.addMoney(amount);
    }
}
