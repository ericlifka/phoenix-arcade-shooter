DefineModule('phoenix/enemy-ship', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('phoenix/sprites/arrow-ship');
    var smallExplosion = require('phoenix/animations/small-explosion');

    return DefineClass(GameObject, {
        constructor: function () {
            this.super('constructor', arguments);

            this.sprite = shipSprite().rotateRight();
            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };
        },
        applyDamage: function (damage) {
            this.exploding = true;
            this.sprite = smallExplosion();

            this.velocity.x = 0;
            this.velocity.y = 0;
            this.position.x -= Math.floor(this.sprite.width / 2);
            this.position.y -= Math.floor(this.sprite.height / 2);
        }
    });
});
