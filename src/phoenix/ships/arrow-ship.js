DefineModule('phoenix/ships/arrow-ship', function (require) {
    var Bullet = require('phoenix/bullet');
    var GameObject = require('models/game-object');
    var MuzzleFlash = require('animations/muzzle-flash');
    var shipSprite = require('phoenix/sprites/arrow-ship');
    var shipExplosion = require('animations/ship-explosion');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        BULLET_SPEED: 100,
        team: 1,

        reset: function () {
            this.super('reset');

            this.sprite = shipSprite().rotateRight();
            this.explosion = shipExplosion;
            this.gun = this.sprite.meta.guns[ 0 ];

            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };

            this.damage = 5;
            this.maxLife = 1;
            this.life = 1;
        },
        fire: function () {

            var position = {
                x: this.position.x + this.gun.x,
                y: this.position.y + this.gun.y
            };
            var velocity = { x: 0, y: this.BULLET_SPEED };

            this.parent.addChild(new Bullet(this.parent, this.team, position, velocity));
            this.addChild(new MuzzleFlash(this, this.gun));
        }
    });
});
