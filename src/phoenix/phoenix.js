DefineModule('phoenix/game', function (require) {
    var LevelManager = require('phoenix/level-manager');
    var playerShipSprite = require('phoenix/sprites/player-ship');

    var Player = DefineClass(GameObject, {
        SPEED: 50,
        BULLET_SPEED: 100,
        FIRE_RATE: 500,
        constructor: function (parent) {
            this.super('constructor', arguments);

            this.sprite = playerShipSprite().rotateRight();
            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };
            this.timeSinceFired = 0;
        },
        processInput: function (input) {
            this.super('processInput', arguments);
            if (this.preventInputControl) {
                // a script is in control of this object
                return;
            }

            this.velocity.x = 0;
            this.velocity.y = 0;

            if (input.W) {
                this.velocity.y -= this.SPEED;
            }
            if (input.A) {
                this.velocity.x -= this.SPEED;
            }
            if (input.S) {
                this.velocity.y += this.SPEED;
            }
            if (input.D) {
                this.velocity.x += this.SPEED;
            }

            if (this.velocity.x && this.velocity.y) {
                this.velocity.x *= .707;
                this.velocity.y *= .707;
            }

            this.firing = input.SPACE;
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
            var position = {
                x: this.position.x + Math.floor(this.sprite.width / 2),
                y: this.position.y
            };
            var velocity = { x: 0, y: -this.BULLET_SPEED };
            var acceleration = { x: 0, y: 0 };

            this.parent.spawnBullet(position, velocity, acceleration);
        }
    });

    var Bullet = DefineClass(GameObject, {
        constructor: function (parent, position, velocity, acceleration) {
            this.super('constructor', arguments);

            this.position = position;
            this.velocity = velocity;
            this.acceleration = acceleration;

            this.sprite = newBulletSprite();
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x + this.sprite.width > this.parent.width
                || this.position.y + this.sprite.height > this.parent.height)
            {
                this.parent.removeChild(this);
            }
        }
    });

    var Phoenix = DefineClass(GameObject, {
        FILL_COLOR: "#020031",
        constructor: function (gameDimensions) {
            this.super('constructor');

            this.width = gameDimensions.width;
            this.height = gameDimensions.height;

            this.levelManager = new LevelManager(this);
            this.player = new Player(this);

            this.addChild(this.levelManager);
            this.addChild(this.player);

            this.levelManager.startLevel();
        },
        spawnBullet: function (position, velocity, acceleration) {
            this.addChild(new Bullet(this, position, velocity, acceleration));
        }
    });

    return function (gameDimensions) {
        return new Phoenix(gameDimensions);
    };
});
