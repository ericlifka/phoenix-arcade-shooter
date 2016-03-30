DefineModule('levels/level-manager', function (require) {
    var FlyPlayerInFromBottom = require('scripts/fly-player-in-from-bottom');
    var GameObject = require('models/game-object');
    var Level_group_01 = require('levels/level-group-01');
    var Shop = require('levels/shop');

    return DefineClass(GameObject, {
        constructor: function (game) {
            this.game = game;
            this.width = game.width;
            this.height = game.height;
            this.player = game.player;

            this.super('constructor', arguments);
        },

        reset: function () {
            this.super('reset');

            this.levelNameCounter = 0;
            this.difficultyMultiplier = 1;
            this.running = false;
            this.complete = false;
            this.currentLevel = null;
            this.shop = new Shop(this, this.game);

            this.loadLevels();
        },
        loadLevels: function () {
            this.levels = [
                new Level_group_01(this, this.game, this.difficultyMultiplier, 1, this.levelName()),
                new Level_group_01(this, this.game, this.difficultyMultiplier, 2),
                new Level_group_01(this, this.game, this.difficultyMultiplier, 3),
                new Level_group_01(this, this.game, this.difficultyMultiplier, "boss"),
                this.shop
            ];
            this.levelIndex = -1;
        },
        start: function () {
            this.running = true;
            this.loadNextLevel();
        },

        stop: function () {
            this.running = false;
            this.removeChild(this.currentLevel);
            this.currentLevel = null;
        },

        loadNextLevel: function () {
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
        },
        update: function () {
            this.super('update', arguments);

            if (this.currentLevel && this.currentLevel.checkIfLevelComplete()) {
                if (this.currentLevel.isShop) {
                    this.removeChild(this.currentLevel);
                } else {
                    this.currentLevel.destroy();
                }

                this.loadNextLevel();
            }
        },

        levelName: function () {
            this.levelNameCounter++;
            return "LEVEL " + this.pad(this.levelNameCounter);
        },
        pad: function (val) {
            if (val < 10) {
                return "00" + val;
            }
            if (val < 100) {
                return "0" + val;
            }
        }
    });
});
