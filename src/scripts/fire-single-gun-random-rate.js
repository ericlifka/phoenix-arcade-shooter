DefineModule('scripts/fire-single-gun-random-rate', function (require) {
    var GameObject = require('models/game-object');
    var Random = require('helpers/random');

    return DefineClass(GameObject, {
        constructor: function (parent, ship, options) {
            this.super('constructor', arguments);
            options = options || {};

            this.ship = ship;
            this.gunIndex = options.gunIndex || 0;
            this.thresholdMin = options.thresholdMin || 1000;
            this.thresholdMax = options.thresholdMax || 3000;
        },

        start: function () {
            this.resetTimer();
            this.threshold += this.thresholdMax;
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
            this.threshold = Random.integer(this.thresholdMin, this.thresholdMax);
        }
    });
});
