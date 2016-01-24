DefineModule('phoenix/screens/controls-description', function (require) {
    var EventedInput = require('models/evented-input');
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
                    "",
                    "Move",
                    "Fire"
                ],
                color: "#F6EC9A",
                position: { x: 5, y: 20 }
            }));
            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: [
                    "- Keyboard",
                    "- WASD",
                    "- Space"
                ],
                color: "#F6EC9A",
                position: { x: 35, y: 20 }
            }));
            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: [
                    "- Controller",
                    "- Left Stick",
                    "- A"
                ],
                color: "#F6EC9A",
                position: { x: 85, y: 20 }
            }));

            this.addChild(new EventedInput({
                onSelect: this.onSelect.bind(this)
            }));
        },

        onSelect: function () {
            this.parent.reset();
        }
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
