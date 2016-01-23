DefineModule('phoenix/game-over-screen', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        reset: function () {
            this.super('reset');

            this.addChild(new TextDisplay(this, {
                font: "arcade",
                message: "GAME OVER",
                color: "red",
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

            this.addChild(new EventedInput({
                onSelect: this.onSelect.bind(this)
            }));
        },

        onSelect: function () {
            this.parent.reset();
        }
    })
});
