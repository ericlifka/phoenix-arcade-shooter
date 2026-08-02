import FlyPlayerInFromBottom from '../scripts/fly-player-in-from-bottom.js';
import GameObject from '../models/game-object.js';
import Hangar from './hangar.js';
import LevelGroup01 from './level-group-01.js';
import LevelGroup02 from './level-group-02.js';
import LevelGroup03 from './level-group-03.js';
import LevelGroup04 from './level-group-04.js';
import LevelSelect from './level-select.js';
import Shop from './shop.js';
import type PlayerControlledShip from '../ships/player-controlled-ship.js';
import type { GameForLevels, HubDestination, LevelGroupKey } from '../types/levels.js';

interface LevelLike extends GameObject {
    checkIfLevelComplete(): boolean;
    start(): void;
    isShop?: boolean;
    levelName?: string;
}

/**
 * Runs the hub loop: the level select map picks a destination, the manager
 * queues that destination's levels, and finishing the queue returns to the map.
 */
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
    previousLevel: LevelLike | null = null;
    hangar!: Hangar;
    shop!: Shop;
    levelSelect!: LevelSelect;
    /** Levels queued for the destination currently being played. */
    levels!: LevelLike[];
    levelIndex!: number;
    activeDestination: HubDestination | null = null;

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
        this.previousLevel = null;
        this.activeDestination = null;
        this.hangar = new Hangar(this, this.game);
        this.shop = new Shop(this, this.game);
        this.levelSelect = new LevelSelect(this, this.game);

        this.loadHub();
    }

    /** Queue the level select map itself — the run always comes back here. */
    loadHub(): void {
        this.activeDestination = null;
        this.levels = [this.levelSelect];
        this.levelIndex = -1;
        this.levelSelect.reset();
    }

    loadDestination(destination: HubDestination): void {
        this.activeDestination = destination;

        switch (destination) {
            case 'shop':
                this.levels = [this.shop];
                break;
            case 'hangar':
                this.levels = [this.hangar];
                break;
            default:
                this.levels = this.buildLevelGroup(destination);
                break;
        }

        this.levelIndex = -1;
    }

    buildLevelGroup(group: LevelGroupKey): LevelLike[] {
        switch (group) {
            case 'slim':
                return this.slimShipLevels();
            case 'dash':
                return this.dashShipLevels();
            case 'standard':
            default:
                return this.standardShipLevels();
        }
    }

    standardShipLevels(): LevelLike[] {
        return [
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 2),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 3),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 4),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 'boss'),
            this.shop,
            new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 2),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 3),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 4),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 'boss'),
            this.shop,
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 2),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 3),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 'boss'),
            this.shop
        ];
    }

    slimShipLevels(): LevelLike[] {
        return [
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 2),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 3),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 4),
            new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 'boss'),
            this.shop,
            new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 2),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 3),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 4),
            new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 'boss'),
            this.shop,
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 2),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 3),
            new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 'boss'),
            this.shop
        ];
    }

    dashShipLevels(): LevelLike[] {
        return [
            new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
            new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 2),
            new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 3),
            new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 4),
            new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 'boss'),
            this.shop
        ];
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
        this.previousLevel = null;
    }

    loadNextLevel(): void {
        if (this.levelIndex >= this.levels.length - 1) {
            // Backstop: nothing left in the queue, so head back to the map.
            this.loadHub();
        }

        this.levelIndex++;
        this.previousLevel = this.currentLevel;
        this.currentLevel = this.levels[this.levelIndex];

        // Tracked on the manager rather than read back out of `levels`, since
        // the previous level often lives in a queue we have already swapped out.
        const cameFromShop = !!this.previousLevel?.isShop;

        if (this.currentLevel.isShop) {
            // Hangar/shop: keep the combat ship off-screen and input-locked.
            // Do not fly in — that would steal stick/keyboard from the menu.
            this.game.clearBullets();
            this.clearFlyInScripts();
            this.player.hideOffscreen();
        } else if (this.currentLevel.levelName || cameFromShop) {
            // Fly in at the start of each level set, or after leaving the shop
            this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
        }

        // The planet map stands alone; every other screen shows the run HUD.
        if (this.currentLevel === this.levelSelect) {
            this.game.hideRunHud();
        } else {
            this.game.showRunHud();
        }

        this.addChild(this.currentLevel);
        this.currentLevel.start();
    }

    update(dtime: number): void {
        super.update(dtime);

        if (this.currentLevel && this.currentLevel.checkIfLevelComplete()) {
            const finishedLevel = this.currentLevel;

            if (finishedLevel.isShop) {
                this.removeChild(finishedLevel);
            } else {
                finishedLevel.destroy();
            }

            if (finishedLevel === this.levelSelect) {
                this.loadDestination(this.levelSelect.destination);
            } else if (this.levelIndex >= this.levels.length - 1) {
                this.finishDestination();
            }

            this.loadNextLevel();
        }
    }

    /**
     * A queued destination ran out of levels. Clearing a combat set makes the
     * next run through any set harder, the same way wrapping the old linear
     * level list used to; shop and hangar visits are free. Combat clears also
     * tick the save file's completion counter for that level set.
     */
    private finishDestination(): void {
        const destination = this.activeDestination;

        if (destination !== null && destination !== 'shop' && destination !== 'hangar') {
            this.difficultyMultiplier++;
            this.game.recordLevelSetCompletion(destination);
        }

        this.loadHub();
    }

    private clearFlyInScripts(): void {
        this.children
            .filter((child) => child instanceof FlyPlayerInFromBottom)
            .forEach((child) => {
                this.removeChild(child);
            });
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
