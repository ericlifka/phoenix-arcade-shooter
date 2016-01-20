DefineModule('phoenix/ships/arrow-boss', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('phoenix/sprites/arrow-boss');
    var shipExplosion = require('phoenix/animations/ship-explosion');

    return DefineClass(GameObject, {
        BULLET_SPEED: 100,
        team: 1,
        damage: 5,

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
            //this.exploding = true;
            //this.sprite = shipExplosion();
            //
            //this.velocity.x = 0;
            //this.velocity.y = 0;
        },
        fire: function () {
            var position = {
                x: this.position.x + Math.floor(this.sprite.width / 2),
                y: this.position.y + this.sprite.height
            };
            var velocity = { x: 0, y: this.BULLET_SPEED };
            var acceleration = { x: 0, y: 0 };

            this.parent.spawnBullet(this.team, position, velocity, acceleration);
        }
    });
});
