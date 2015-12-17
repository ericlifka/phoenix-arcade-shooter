window.newPhoenixModel = (function () {

    function Player(parent) {
        this.parent = parent;
        this.sprite = newPhoenixPlayerShip().rotateRight();

        this.setStartingPosition();
        this.timeSinceMoved = 0;
    }
    Player.prototype = {
        MOVEMENT_DELAY: 20,
        processInput: function (input) {
            this.velocity.x = 0;
            this.velocity.y = 0;

            if (input.W) {
                this.velocity.y--;
            }
            if (input.A) {
                this.velocity.x--;
            }
            if (input.S) {
                this.velocity.y++;
            }
            if (input.D) {
                this.velocity.x++;
            }
        },
        update: function (dtime) {
            this.timeSinceMoved += dtime;

            if ((this.velocity.x || this.velocity.y)
                && this.timeSinceMoved > this.MOVEMENT_DELAY)
            {
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                this.timeSinceMoved = 0;
            }
        },
        renderToFrame: function (frame) {
            this.sprite.renderToFrame(this.position.x, this.position.y, frame);
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
        }
    };

    return function (gameDimensions) {
        return new Phoenix(gameDimensions);
    };
}());
