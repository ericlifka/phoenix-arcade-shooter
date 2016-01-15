DefineModule('phoenix/level-manager', function (require) {
    var FlyPlayerInFromBottom = require('phoenix/scripts/fly-player-in-from-bottom');
    var GameObject = require('models/game-object');
    var Level_group_01 = require('phoenix/levels/level-group-01');

    return DefineClass(GameObject, {
        //levels: [null, Level_01],

        constructor: function (game) {
            this.super('constructor', arguments);

            this.game = game;
            this.levelIndex = -1;

            this.levels = [
                new Level_group_01(this, this.game, 1, "LEVEL 01"),
                new Level_group_01(this, this.game, 2, "LEVEL 02"),
                new Level_group_01(this, this.game, 3, "LEVEL 03")
            ];
        },

        start: function () {
            this.loadNextLevel();
            this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
        },

        loadNextLevel: function () {
            this.levelIndex++;
            this.currentLevel = this.levels[ this.levelIndex ];

            if (this.currentLevel) {
                this.addChild(this.currentLevel);
                this.currentLevel.start();
            } else {
                console.log('all levels complete');
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
