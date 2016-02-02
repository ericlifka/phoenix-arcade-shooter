DefineModule('ships/player-controlled-ship', function (require) {
    var Bullet = require('components/bullet');
    var GameObject = require('models/game-object');
    var MuzzleFlash = require('components/muzzle-flash');
    var playerShipSprite = require('sprites/player-ship');
    var shipExplosion = require('sprites/animations/ship-explosion');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        index: 5,

        reset: function () {
            this.super('reset');

            this.sprite = playerShipSprite().rotateRight();
            this.explosion = shipExplosion;

            this.position = { x: -100, y: -100 };
            this.velocity = { x: 0, y: 0 };

            this.life = 10;
            this.maxLife = 10;

            this.SPEED = 50;
            this.BULLET_SPEED = 100;
            this.FIRE_RATE = 500;

            this.preventInputControl = true;
            this.exploding = false;
            this.team = 0;
            this.damage = 5;
            this.timeSinceFired = 0;
        },
        processInput: function (input) {
            this.super('processInput', arguments);
            if (this.preventInputControl || this.exploding || this.destroyed) {
                // ship in a state where input isn't appropriate
                return;
            }

            this.velocity.x = input.movementVector.x * this.SPEED;
            this.velocity.y = input.movementVector.y * this.SPEED;

            this.firing = input.fire;
        },
        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceFired += dtime;
            if (this.firing && this.timeSinceFired > this.FIRE_RATE) {
                this.timeSinceFired = 0;

                this.fire();
            }
        },
        checkBoundaries: function () {
            if (this.preventInputControl) {
                // don't check screen boundaries when an external script is controlling the player
                return;
            }

            if (this.position.x < 0) {
                this.position.x = 0;
            }
            if (this.position.y < 0) {
                this.position.y = 0;
            }
            if (this.position.x + this.sprite.width > this.parent.width) {
                this.position.x = this.parent.width - this.sprite.width;
            }
            if (this.position.y + this.sprite.height > this.parent.height) {
                this.position.y = this.parent.height - this.sprite.height;
            }
        },
        fire: function () {
            var gun = this.sprite.meta.guns[0];

            var position = {
                x: this.position.x + gun.x,
                y: this.position.y + gun.y
            };
            var velocity = { x: 0, y: -this.BULLET_SPEED };

            this.parent.addChild(new Bullet(this.parent, this.team, position, velocity));
            this.addChild(new MuzzleFlash(this, gun));
        },

        applyDamage: function () {
            this.triggerEvent('playerHit');
            this.super('applyDamage', arguments);
        }
    });
});
