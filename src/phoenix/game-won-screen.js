DefineModule('phoenix/game-won-screen', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        reset: function () {
            this.super('reset');

            this.inputReleased = false;
            this.resetPressed = false;

            this.addChild(new TextDisplay(this, {
                font: "arcade",
                message: "YOU WIN!",
                color: "green",
                border: 1,
                background: this.parent.FILL_COLOR,
                padding: 20,
                position: { x: 45, y: 45 }
            }));
            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: "< hit start >",
                color: "red",
                position: { x: 75, y: 81 }
            }));
        },

        processInput: function (input) {
            if (!input.menuSelect && !input.fire) {
                this.inputReleased = true;
            }
            if (!this.resetPressed && this.inputReleased && (input.menuSelect || input.fire)) {
                this.resetPressed = true;
                this.parent.reset();
            }
        }
    })
});
