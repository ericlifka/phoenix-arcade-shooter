DefineModule('phoenix/game-won-screen', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        headerDef: {
            font: "arcade",
            message: "YOU WIN!!",
            color: "green",
            border: 1,
            background: this.parent.FILL_COLOR,
            padding: 20,
            position: { x: 45, y: 45 }
        },
        subHeaderDef: {
            font: "arcade-small",
            message: "< hit start >",
            color: "green",
            position: { x: 75, y: 81 }
        },

        reset: function () {
            this.super('reset');

            this.addChild(new TextDisplay(this, this.headerDef));
            this.addChild(new TextDisplay(this, this.subHeaderDef));

            this.addChild(new EventedInput({
                onSelect: this.onSelect.bind(this)
            }));
        },

        onSelect: function () {
            this.parent.reset();
        }
    })
});
