DefineModule('levels/level-group-02', function (require) {
    var GameObject = require('models/game-object');
    var FlyingSaucer = require('ships/flying-saucer');

    return DefineClass(GameObject, {
        constructor: function (parent, game, difficultyMultiplier, shipCount, levelName) {
            this.super('constructor', arguments);

            if (groupCount === "boss") {
                groupCount = 1;
                this.boss = true;
            }

            this.game = game;
            this.levelName = levelName;
            this.rowCount = groupCount;
        },

        start: function () {

        },

        checkIfLevelComplete: function () {

        }
    });
});
