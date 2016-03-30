DefineModule('ships/arrow-boss', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('sprites/arrow-boss');
    var shipExplosion = require('sprites/animations/ship-explosion');
    var MuzzleFlash = require('components/muzzle-flash');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        BULLET_SPEED: 120,
        team: 1,
        index: 5,

        constructor: function (parent, difficultyMultiplier) {
            this.difficultyMultiplier = difficultyMultiplier;
            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.sprite = shipSprite().rotateRight();
            this.explosion = shipExplosion;
            this.guns = this.sprite.meta.guns;

            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };

            this.damage = 50 * this.difficultyMultiplier;
            this.life = 25 * this.difficultyMultiplier;
            this.maxLife = 25 * this.difficultyMultiplier;
        },
        fire: function (gunIndex) {
            var gun = this.guns[ gunIndex ];

            var position = {
                x: this.position.x + gun.x,
                y: this.position.y + gun.y
            };
            var velocity = { x: 0, y: this.BULLET_SPEED };

            this.triggerEvent('spawnBullet', {
                team: this.team,
                position: position,
                velocity: velocity,
                damage: this.difficultyMultiplier
            });
            this.addChild(new MuzzleFlash(this, gun));
        },
        applyDamage: function () {
            this.triggerEvent('enemyHit');
            this.super('applyDamage', arguments);
        },
        destroy: function () {
            this.triggerEvent('enemyDestroyed', {
                shipValue: this.maxLife
            });

            this.super('destroy', arguments);
        }
    });
});
