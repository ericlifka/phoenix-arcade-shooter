DefineModule('phoenix/levels/level-group', function (require) {
    var GameObject = require('model/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, levels) {
            this.super('constructor', arguments);

            var self = this;
            levels.forEach(function (level) {
                level.parent = self;
            });
        }
    });
});
