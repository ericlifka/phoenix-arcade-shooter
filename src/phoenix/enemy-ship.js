DefineModule('phoenix/enemy-ship', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('phoenix/sprites/arrow-ship');
    var mediumExplosion = require('phoenix/animations/medium-explosion');

    return DefineClass(GameObject, {
        constructor: function () {
            this.super('constructor', arguments);

            this.sprite = shipSprite().rotateRight();
            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };
        },
        update: function () {
            this.super('update', arguments);

            if (this.exploding && this.sprite.finished) {
                this.destroy();
            }
        },
        applyDamage: function (damage) {
            this.exploding = true;
            this.sprite = mediumExplosion();

            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    });
});
