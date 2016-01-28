DefineModule('components/bullet', function (require) {
    var GameObject = require('models/game-object');
    var bulletSprite = require('sprites/bullet');
    var smallExplosion = require('sprites/animations/small-explosion');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,

        constructor: function (parent, team, position, velocity, acceleration) {
            this.super('constructor', arguments);

            this.team = team;
            this.position = position;
            this.velocity = velocity;
            this.acceleration = acceleration;

            this.sprite = bulletSprite();
            this.explosion = smallExplosion;

            this.life = 0;
            this.maxLife = 1;
            this.damage = 1;

            this.updateBulletDirection();
            this.updateColor();
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x + this.sprite.width > this.parent.width
                || this.position.y + this.sprite.height > this.parent.height) {

                this.destroy();
            }
        },
        updateBulletDirection: function () {
            if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y)) {
                this.sprite.rotateRight();
            }
        },
        updateColor: function () {
            switch (this.team) {
                case 0: this.sprite.applyColor("#B1D8AD"); break;
                case 1: this.sprite.applyColor("#F7BEBE"); break;
                default: break;
            }
        },
        applyDamage: function (damage) {
            this.super('applyDamage', arguments);

            this.position.x -= Math.floor(this.sprite.width / 2);
            this.position.y -= Math.floor(this.sprite.height / 2);
        }
    });
});
