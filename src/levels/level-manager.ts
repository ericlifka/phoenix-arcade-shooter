import FlyPlayerInFromBottom from '../scripts/fly-player-in-from-bottom.js';
import GameObject from '../models/game-object.js';
import LevelGroup01 from './level-group-01.js';
import LevelGroup03 from './level-group-03.js';
import Shop from './shop.js';
import type PlayerControlledShip from '../ships/player-controlled-ship.js';
import type { GameForLevels } from '../types/levels.js';

interface LevelLike extends GameObject {
    checkIfLevelComplete(): boolean;
    start(): void;
    isShop?: boolean;
    levelName?: string;
}

export default class LevelManager extends GameObject {
    game: GameForLevels;
    width: number;
    height: number;
    player: PlayerControlledShip;

    levelNameCounter!: number;
    difficultyMultiplier!: number;
    running!: boolean;
    complete!: boolean;
    currentLevel: LevelLike | null = null;
    shop!: Shop;
    levels!: LevelLike[];
    levelIndex!: number;

    constructor(parent: GameObject | null | undefined, game: GameForLevels) {
        super(parent);

        this.game = game;
        this.width = game.width;
        this.height = game.height;
        this.player = game.player;

        this.reset();
    }

    reset(): void {
        super.reset();

        this.levelNameCounter = 0;
        this.difficultyMultiplier = 1;
        this.running = false;
        this.complete = false;
        this.currentLevel = null;
        this.shop = new Shop(this, this.game);

        this.loadLevels();
    }

    loadLevels(): void {
        this.levels = [
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 2),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 3),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 4),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 'boss'),
            this.shop,
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 2),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 3),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 4),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 'boss'),
            this.shop,
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 2),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 3),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 'boss'),
            this.shop,
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 2),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 3),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 'boss'),
            this.shop
        ];
        this.levelIndex = -1;
    }

    start(): void {
        this.running = true;
        this.loadNextLevel();
    }

    stop(): void {
        this.running = false;
        if (this.currentLevel) {
            this.removeChild(this.currentLevel);
        }
        this.currentLevel = null;
    }

    loadNextLevel(): void {
        if (this.levelIndex >= this.levels.length - 1) {
            // last level was completed
            this.difficultyMultiplier++;
            this.loadLevels();
        }

        this.levelIndex++;
        this.currentLevel = this.levels[this.levelIndex];

        const previousLevel = this.levelIndex > 0 ? this.levels[this.levelIndex - 1] : null;
        const cameFromShop = !!previousLevel?.isShop;

        if (this.currentLevel.isShop) {
            this.game.clearBullets();
            this.player.hideOffscreen();
        }

        if (this.currentLevel.levelName || cameFromShop) {
            // Fly in at the start of each level set, or after any shop visit
            this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
        }

        this.addChild(this.currentLevel);
        this.currentLevel.start();
    }

    update(dtime: number): void {
        super.update(dtime);

        if (this.currentLevel && this.currentLevel.checkIfLevelComplete()) {
            if (this.currentLevel.isShop) {
                this.removeChild(this.currentLevel);
            } else {
                this.currentLevel.destroy();
            }

            this.loadNextLevel();
        }
    }

    levelName(): string {
        this.levelNameCounter++;
        return 'LEVEL ' + this.pad(this.levelNameCounter);
    }

    pad(val: number): string | undefined {
        if (val < 10) {
            return '00' + val;
        }
        if (val < 100) {
            return '0' + val;
        }
    }
}
