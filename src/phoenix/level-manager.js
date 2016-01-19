DefineModule('phoenix/level-manager', function (require) {
    var FlyPlayerInFromBottom = require('phoenix/scripts/fly-player-in-from-bottom');
    var GameObject = require('models/game-object');
    var Level_group_01 = require('phoenix/levels/level-group-01');

    return DefineClass(GameObject, {
        constructor: function (game) {
            this.super('constructor', arguments);

            this.game = game;
        },

        reset: function () {
            this.super('reset');
            
            this.running = false;
            this.levelIndex = -1;
            this.currentLevel = null;
            this.levels = [
                new Level_group_01(this, this.game, 1, "LEVEL 01"),
                new Level_group_01(this, this.game, 2),
                new Level_group_01(this, this.game, 3)
            ];
        },

        start: function () {
            this.running = true;
            this.loadNextLevel();
            this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
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
                this.running = false;
            }
        },
        update: function () {
            this.super('update', arguments);

            if (this.currentLevel && this.currentLevel.checkIfLevelComplete()) {
                this.currentLevel.cleanup();
                this.removeChild(this.currentLevel);
                this.loadNextLevel();
            }
        }
    });
});
