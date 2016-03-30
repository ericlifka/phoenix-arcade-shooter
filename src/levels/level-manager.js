DefineModule('levels/level-manager', function (require) {
    var GameObject = require('models/game-object');
    var Level_group_01 = require('levels/level-group-01');
    var Shop = require('levels/shop');

    return DefineClass(GameObject, {
        constructor: function (game) {
            this.width = game.width;
            this.height = game.height;
            this.game = game;

            this.super('constructor', arguments);
        },

        reset: function () {
            this.super('reset');

            this.running = false;
            this.complete = false;
            this.levelIndex = -1;
            this.currentLevel = null;
            this.shop = new Shop(this, this.game);

            this.levels = [
                this.shop,
                new Level_group_01(this, this.game, 1, "LEVEL 01"),
                new Level_group_01(this, this.game, 2),
                new Level_group_01(this, this.game, 3),
                new Level_group_01(this, this.game, "boss")
            ];
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
            this.levelIndex++;
            this.currentLevel = this.levels[ this.levelIndex ];

            if (this.currentLevel) {
                this.addChild(this.currentLevel);
                this.currentLevel.start();
            } else {
                console.log('all levels complete');
                this.complete = true;
                this.running = false;
            }
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
        }
    });
});
