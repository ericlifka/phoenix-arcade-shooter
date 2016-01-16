DefineModule('phoenix/title-screen', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        constructor: function (parent) {
            this.super('constructor', arguments);

            this.addChild(new TextDisplay(this, {
                message: "PHOENIX",
                position: { x: 55, y: 50 },
                border: true,
                padding: 15,
                // color: colorGradient[ this.colorIndex ],
                font: "phoenix"
            }));
        }
    });
});
