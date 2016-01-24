DefineModule('models/evented-input', function (require) {
    return DefineClass({
        constructor: function (options) {
            this.upReleased = false;
            this.downReleased = false;
            this.selectReleased = false;

            this.onUp = options.onUp || function () {};
            this.onDown = options.onDown || function () {};
            this.onSelect = options.onSelect || function () {};
        },

        processInput: function (input) {
            if (input.movementVector.y < .6) {
                this.downReleased = true;
            }
            if (input.movementVector.y > -.6) {
                this.upReleased = true;
            }
            if (!input.menuSelect && !input.fire) {
                this.selectReleased = true;
            }

            if (input.movementVector.y >= .6 && this.downReleased) {
                this.downReleased = false;
                this.onDown();
            }
            if (input.movementVector.y <= -.6 && this.upReleased) {
                this.upReleased = false;
                this.onUp();
            }
            if ((input.menuSelect || input.fire) && this.selectReleased) {
                this.selectReleased = false;
                this.onSelect();
            }
        }
    });
});
