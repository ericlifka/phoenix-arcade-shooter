DefineModule('components/bullet', function (require) {
    var GameObject = require('models/game-object');
    var bulletSprite = require('sprites/bullet');
    var smallExplosion = require('sprites/animations/small-explosion');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        index: 5,

        constructor: function (parent, options) {
            this.super('constructor', arguments);

            options = options || { };
            this.team = options.team || 0;
            this.position = options.position || { x: 0, y: 0 };
            this.velocity = options.velocity || { x: 0, y: 0 };
            this.acceleration = options.acceleration || { x: 0, y: 0 };
            this.damage = options.damage || 1;
            this.life = options.life || 0;
            this.maxLife = options.maxLife || 1;

            this.sprite = bulletSprite();
            this.explosion = smallExplosion;

            this.updateBulletDirection();
            this.updateColor();
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x > this.parent.width
                || this.position.y > this.parent.height) {

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
