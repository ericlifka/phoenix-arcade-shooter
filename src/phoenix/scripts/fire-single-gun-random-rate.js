DefineModule('phoenix/scripts/fire-single-gun-random-rate', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, ship) {
            this.super('constructor', arguments);

            this.ship = ship;
        }
    });
});
