DefineModule('phoenix/ships/arrow-boss', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('phoenix/sprites/arrow-boss');
    var shipExplosion = require('phoenix/animations/ship-explosion');
    var MuzzleFlash = require('phoenix/animations/muzzle-flash');

    return DefineClass(GameObject, {
        BULLET_SPEED: 100,
        damage: 50,
        team: 1,

        reset: function () {
            this.super('reset');

            this.sprite = shipSprite().rotateRight();
            this.explosion = shipExplosion;
            this.guns = this.sprite.meta.guns;

            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };

            this.life = 10;
            this.maxLife = 10;
        },
        fire: function (gunIndex) {
            var gun = this.guns[ gunIndex ];

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
