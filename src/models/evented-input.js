DefineModule('models/evented-input', function (require) {
    return DefineClass({
        constructor: function (options) {
            this.upReleased = false;
            this.downReleased = false;

            this.onUp = options.onUp || function () {};
            this.onDown = options.onDown || function () {};
        },

        processInput: function (input) {
            if (input.movementVector.y < .6) {
                this.upReleased = true;
            }
            if (input.movementVector.y > -.6) {
                this.downReleased = true;
            }

            if (input.movementVector.y >= .6 && this.upReleased) {
                this.upReleased = false;
                this.onUp();
            }
            if (input.movementVector.y <= -.6 && this.downReleased) {
                this.downReleased = false;
                this.onDown();
            }
        }
    });
});
