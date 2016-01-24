DefineModule('phoenix/screens/controls-description', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        reset: function () {
            this.super('reset');

            this.addChild(new TextDisplay(this, {
                font: "arcade",
                message: "Controls",
                color: "white",
                position: { x: 5, y: 5 }
            }));

            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: [
                    "          - Keyboard - Controller",
                    "Move      - WASD     - Left Stick",
                    "Fire      - Space    - A"
                ],
                color: "#F6EC9A",
                position: { x: 5, y: 20 }
            }));
        },
        //
        //processInput: function (input) {
        //    if (!input.menuSelect && !input.fire) {
        //        this.inputReleased = true;
        //    }
        //    if (!this.resetPressed && this.inputReleased && (input.menuSelect || input.fire)) {
        //        this.resetPressed = true;
        //        this.parent.reset();
        //    }
        //}
    })
});
