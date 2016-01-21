DefineModule('phoenix/ships/arrow-ship', function (require) {
    var GameObject = require('models/game-object');
    var MuzzleFlash = require('phoenix/animations/muzzle-flash');
    var shipSprite = require('phoenix/sprites/arrow-ship');
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
            this.exploding = true;
            this.sprite = shipExplosion();

            this.velocity.x = 0;
            this.velocity.y = 0;
        },
        fire: function () {
            var gun = shipSprite.meta.guns[0];

            var position = {
                x: this.position.x + gun.x,
                y: this.position.y + gun.y
            };
            var velocity = { x: 0, y: this.BULLET_SPEED };

            this.parent.spawnBullet(this.team, position, velocity);
            this.addChild(new MuzzleFlash(this, gun));
        }
    });
});
