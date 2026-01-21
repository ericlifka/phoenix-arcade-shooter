import FlyPlayerInFromBottom from '../scripts/fly-player-in-from-bottom.js';
import GameObject from '../models/game-object.js';
import Level_group_01 from './level-group-01.js';
import Shop from './shop.js';

export default class LevelManager extends GameObject {
    constructor(parent, game) {
        super(parent);
        
        this.game = game;
        this.width = game.width;
        this.height = game.height;
        this.player = game.player;
        
        this.reset();
    }

    reset() {
        super.reset();

        this.levelNameCounter = 0;
        this.difficultyMultiplier = 1;
        this.running = false;
        this.complete = false;
        this.currentLevel = null;
        this.shop = new Shop(this, this.game);

        this.loadLevels();
    }

    loadLevels() {
        this.levels = [
            new Level_group_01(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
            new Level_group_01(this, this.game, this.difficultyMultiplier, false, 2),
            new Level_group_01(this, this.game, this.difficultyMultiplier, false, 3),
            new Level_group_01(this, this.game, this.difficultyMultiplier, false, 4),
            new Level_group_01(this, this.game, this.difficultyMultiplier, false, "boss"),
            this.shop,
            new Level_group_01(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
            new Level_group_01(this, this.game, this.difficultyMultiplier, true, 2),
            new Level_group_01(this, this.game, this.difficultyMultiplier, true, 3),
            new Level_group_01(this, this.game, this.difficultyMultiplier, true, 4),
            new Level_group_01(this, this.game, this.difficultyMultiplier, true, "boss"),
            this.shop
        ];
        this.levelIndex = -1;
    }

    start() {
        this.running = true;
        this.loadNextLevel();
    }

    stop() {
        this.running = false;
        this.removeChild(this.currentLevel);
        this.currentLevel = null;
    }

    loadNextLevel() {
        if (this.levelIndex >= this.levels.length - 1) { // last level was completed
            this.difficultyMultiplier++;
            this.loadLevels();
        }

        this.levelIndex++;
        this.currentLevel = this.levels[ this.levelIndex ];

        if (this.currentLevel.isShop) {
            this.game.clearBullets();
            this.player.hideOffscreen();
        }

        if (this.currentLevel.levelName) { // kinda derp way of knowing where the level blocks start
            this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
            this.player.refillHealth();
        }

        this.addChild(this.currentLevel);
        this.currentLevel.start();
    }

    update(dtime) {
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

    levelName() {
        this.levelNameCounter++;
        return "LEVEL " + this.pad(this.levelNameCounter);
    }

    pad(val) {
        if (val < 10) {
            return "00" + val;
        }
        if (val < 100) {
            return "0" + val;
        }
    }
}
