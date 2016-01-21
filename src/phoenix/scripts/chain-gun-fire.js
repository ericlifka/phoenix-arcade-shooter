DefineModule('phoenix/scripts/chain-gun-fire', function (require) {
    var GameObject = require('models/game-object');
    var Random = require('helpers/random');

    return DefineClass(GameObject, {
        constructor: function (parent, ship, gunIndex) {
            this.super('constructor', arguments);

            this.ship = ship;
            this.gunIndex = gunIndex || 0;
        },

        start: function () {
            this.resetTimer();
            this.threshold += 3000;
        },

        update: function (dtime) {
            if (this.ship.destroyed) {
                this.destroy();
            }

            this.elapsed += dtime;

            if (this.elapsed > this.threshold) {
                this.resetTimer();
                this.ship.fire(this.gunIndex);
            }
        },

        resetTimer: function () {
            this.elapsed = 0;
            this.threshold = Random.integer(1000, 3000);
        }
    });
});
