DefineModule('phoenix/bullet', function (require) {
    var GameObject = require('models/game-object');
    var bulletSprite = require('phoenix/sprites/bullet');
    var smallExplosion = require('phoenix/animations/small-explosion');

    return DefineClass(GameObject, {
        damage: 1,
        constructor: function (parent, team, position, velocity, acceleration) {
            this.super('constructor', arguments);

            this.team = team;
            this.position = position;
            this.velocity = velocity;
            this.acceleration = acceleration;

            this.sprite = bulletSprite();
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x + this.sprite.width > this.parent.width
                || this.position.y + this.sprite.height > this.parent.height) {

                this.destroy();
            }
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
