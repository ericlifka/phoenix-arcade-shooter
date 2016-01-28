DefineModule('screens/controls-description', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        headerDef: {
            font: "arcade",
            message: "Controls",
            color: "white",
            position: { x: 5, y: 5 }
        },
        inputDescriptions: [
            {
                message: [ "", "Move", "Fire" ],
                position: { x: 5, y: 20 }
            },
            {
                message: [ "- Keyboard", "- WASD", "- Space" ],
                position: { x: 35, y: 20 }
            },
            {
                message: [ "- Controller", "- Left Stick", "- A" ],
                position: { x: 85, y: 20 }
            }
        ],

        reset: function () {
            this.super('reset');

            this.addChild(new TextDisplay(this, this.headerDef));

            this.inputDescriptions.forEach(function (item) {
                this.addChild(new TextDisplay(this, {
                    font: "arcade-small",
                    color: "#F6EC9A",
                    message: item.message,
                    position: item.position
                }))
            }.bind(this));

            this.addChild(new EventedInput({
                onSelect: this.onSelect.bind(this)
            }));
        },

        onSelect: function () {
            this.parent.reset();
        }
    })
});
