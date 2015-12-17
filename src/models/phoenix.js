window.newPhoenixModel = (function () {

    function Player(parent) {
        this.parent = parent;
        this.sprite = newPhoenixPlayerShip().rotateRight();

        this.setStartingPosition();
        this.timeSinceFired = 0;
    }
    Player.prototype = {
        SPEED: 50,
        FIRE_RATE: 1000,
        processInput: function (input) {
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
            this.position.x += this.velocity.x * dtime / 1000;
            this.position.y += this.velocity.y * dtime / 1000;
            this.checkBoundaries();

            this.timeSinceFired += dtime;
            if (this.firing && this.timeSinceFired > this.FIRE_RATE) {
                this.fire();
            }
        },
        renderToFrame: function (frame) {
            this.sprite.renderToFrame(Math.floor(this.position.x), Math.floor(this.position.y), frame);
        },
        setStartingPosition: function () {
            this.position = {
                x: Math.floor(this.parent.width / 2 - this.sprite.width / 2),
                y: this.parent.height - this.sprite.height - 1
            };
            this.velocity = {
                x: 0,
                y: 0
            };
        },
        checkBoundaries: function () {
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
            var velocity = { x: 0, y: -1 };
            var acceleration = { x: 0, y: 0 };

            this.parent.spawnBullet(position, velocity, acceleration);
        }
    };

    function Phoenix(gameDimensions) {
        this.width = gameDimensions.width;
        this.height = gameDimensions.height;

        this.player = new Player(this);

        this.children = [
            this.player
        ];
    }

    Phoenix.prototype = {
        FILL_COLOR: "#020031",
        processInput: function (input) {
            this.children.forEach(function (child) {
                child.processInput(input);
            })
        },
        update: function (dtime) {
            this.children.forEach(function (child) {
                child.update(dtime);
            })
        },
        renderToFrame: function (frame) {
            this.children.forEach(function (child) {
                child.renderToFrame(frame);
            })
        },
        spawnBullet: function (position, velocity, acceleration) {
            
        }
    };

    return function (gameDimensions) {
        return new Phoenix(gameDimensions);
    };
}());
