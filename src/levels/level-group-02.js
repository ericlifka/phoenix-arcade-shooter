DefineModule('levels/level-group-02', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, game, groupCount, levelName) {
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
