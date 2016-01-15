DefineModule('phoenix/scripts/fire-single-gun-random-rate', function (require) {
    var GameObject = require('models/game-object');
    var Random = require('helpers/random');

    return DefineClass(GameObject, {
        constructor: function (parent, ship) {
            this.super('constructor', arguments);

            this.ship = ship;
        },

        start: function () {
            this.resetTimer();
        },

        update: function (dtime) {
            this.elapsed += dtime;

            if (this.elapsed > this.threshold) {
                this.resetTimer();
                this.ship.fire();
            }
        },

        resetTimer: function () {
            this.elapsed = 0;
            this.threshold = Random.integer(1000, 3000);
        }
    });
});
