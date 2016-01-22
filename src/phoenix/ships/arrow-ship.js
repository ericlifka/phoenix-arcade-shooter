DefineModule('phoenix/ships/arrow-ship', function (require) {
    var GameObject = require('models/game-object');
    var MuzzleFlash = require('phoenix/animations/muzzle-flash');
    var shipSprite = require('phoenix/sprites/arrow-ship');
    var shipExplosion = require('phoenix/animations/ship-explosion');

    return DefineClass(GameObject, {
        BULLET_SPEED: 100,
        team: 1,

        reset: function () {
            this.super('reset');

            this.sprite = shipSprite().rotateRight();
            this.explosion = shipExplosion;

            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };

            this.damage = 5;
            this.maxLife = 1;
            this.life = 1;
        },
        fire: function () {
            var gun = this.sprite.meta.guns[0];

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
