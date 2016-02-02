DefineModule('scripts/chain-gun-fire', function (require) {
    var GameObject = require('models/game-object');
    var Random = require('helpers/random');

    return DefineClass(GameObject, {
        constructor: function (parent, ship, options) {
            this.super('constructor', arguments);
            options = options || {};

            this.ship = ship;
            this.gunIndex = options.gunIndex || 0;
            this.fireRate = options.fireRate || 150;
            this.burstSize = options.burstSize || 5;
            this.thresholdMin = options.thresholdMin || 2000;
            this.thresholdMax = options.thresholdMax || 6000;
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

            if (this.firing) {

                if (this.elapsed > this.fireRate) {
                    this.elapsed -= this.fireRate;
                    this.burstCount++;
                    this.ship.fire(this.gunIndex);

                    if (this.burstCount > this.burstSize) {
                        this.firing = false;
                        this.resetTimer();
                    }
                }

            }
            else {

                if (this.elapsed > this.threshold) {
                    this.firing = true;
                    this.elapsed = 0;
                    this.burstCount = 0;
                }

            }
        },

        resetTimer: function () {
            this.elapsed = 0;
            this.threshold = Random.integer(this.thresholdMin, this.thresholdMax);
        }
    });
});
