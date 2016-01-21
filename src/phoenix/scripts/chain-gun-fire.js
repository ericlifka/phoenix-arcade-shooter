DefineModule('phoenix/scripts/chain-gun-fire', function (require) {
    var GameObject = require('models/game-object');
    var Random = require('helpers/random');

    return DefineClass(GameObject, {
        constructor: function (parent, ship, gunIndex) {
            this.super('constructor', arguments);

            this.ship = ship;
            this.gunIndex = gunIndex || 0;
            this.fireRate = 100;
            this.burstSize = 10;
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
            this.threshold = Random.integer(1000, 3000);
        }
    });
});
