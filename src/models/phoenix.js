window.newPhoenixModel = (function () {

    function Player() {
        this.position_x = 10;
        this.position_y = 10;
        // this.sprite = newPhoenixPlayerShip();
        this.sprite = newPhoenixPlayerShip().rotateRight();
        // this.sprite = newPhoenixPlayerShip().rotateLeft();
        // this.sprite = newPhoenixPlayerShip().invert();
    }
    Player.prototype = {
        processInput: function (input) {
            if (input.W) {
                this.position_y--;
            }
            if (input.A) {
                this.position_x--;
            }
            if (input.S) {
                this.position_y++;
            }
            if (input.D) {
                this.position_x++;
            }
        },
        update: function () { },
        renderToFrame: function (frame) {
            this.sprite.renderToFrame(this.position_x, this.position_y, frame);
        }
    };

    function Phoenix() {
        this.player = new Player();

        this.children = [
            this.player
        ];
    }

    Phoenix.prototype = {
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

    return function () {
        return new Phoenix();
    };
}());
