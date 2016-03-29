DefineModule('levels/level-group-01', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, game) {
            this.super('constructor', arguments);
        }
    });
});
