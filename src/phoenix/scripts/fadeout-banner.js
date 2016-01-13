DefineModule('phoenix/scripts/fadeout-banner', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('models/text-display');

    return DefineClass(GameObject, {
        constructor: function (parent, text, time) {
            this.super('constructor', arguments);

            this.text = text;

            this.addChild(new TextDisplay(this, {
                message: "LEVEL 01",
                position: { x: 55, y: 50 },
                border: true,
                padding: 15,
                background: this.parent.game.FILL_COLOR,
                font: "arcade"
            }));
        },
        start: function () {}
    });
});
