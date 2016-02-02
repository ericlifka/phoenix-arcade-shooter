DefineModule('models/evented-input', function (require) {
    return DefineClass({
        constructor: function (options) {
            this.upReleased = false;
            this.downReleased = false;
            this.fireReleased = false;
            this.startReleased = false;

            this.onUp = options.onUp || function () {};
            this.onDown = options.onDown || function () {};
            this.onFire = options.onFire || function () {};
            this.onStart = options.onStart || function () {};
            this.onSelect = options.onSelect || function () {};
        },

        processInput: function (input) {
            if (input.movementVector.y < .6) {
                this.downReleased = true;
            }
            if (input.movementVector.y > -.6) {
                this.upReleased = true;
            }
            if (!input.start) {
                this.startReleased = true;
            }
            if (!input.fire) {
                this.fireReleased = true;
            }

            if (input.movementVector.y >= .6 && this.downReleased) {
                this.downReleased = false;
                this.onDown();
            }
            if (input.movementVector.y <= -.6 && this.upReleased) {
                this.upReleased = false;
                this.onUp();
            }
            if (input.start && this.startReleased) {
                this.startReleased = false;
                this.onStart();
                this.onSelect();
            }
            if (input.fire && this.fireReleased) {
                this.fireReleased = false;
                this.onFire();
                this.onSelect();
            }
        }
    });
});
