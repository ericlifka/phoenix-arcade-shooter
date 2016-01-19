DefineModule('phoenix/ships/player-controlled-ship', function (require) {
    var GameObject = require('models/game-object');
    var playerShipSprite = require('phoenix/sprites/player-ship');
    var shipExplosion = require('phoenix/animations/ship-explosion');

    return DefineClass(GameObject, {
        reset: function () {
            this.super('reset');

            this.sprite = playerShipSprite().rotateRight();

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
            if (this.preventInputControl) {
                // a script is in control of this object
                return;
            }

            this.velocity.x = input.movementVector.x * this.SPEED;
            this.velocity.y = input.movementVector.y * this.SPEED;

            this.firing = input.fire;
        },
        update: function (dtime) {
            this.super('update', arguments);

            if (this.exploding && this.sprite.finished) {
                this.destroy();
            }

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
            var position = {
                x: this.position.x + Math.floor(this.sprite.width / 2),
                y: this.position.y - 2
            };
            var velocity = { x: 0, y: -this.BULLET_SPEED };
            var acceleration = { x: 0, y: 0 };

            this.parent.spawnBullet(this.team, position, velocity, acceleration);
        },
        applyDamage: function (damage) {
            this.life -= damage;

            if (this.life <= 0) {
                this.exploding = true;
                this.sprite = shipExplosion();

                this.velocity.x = 0;
                this.velocity.y = 0;
                this.preventInputControl = true;
            }
        }
    });
});
