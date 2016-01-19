DefineModule('phoenix/game-over-screen', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        constructor: function () {
            this.super('constructor', arguments);

            this.addChild(new TextDisplay(this, {
                font: "arcade",
                message: "GAME OVER",
                color: "red",
                position: { x: 75, y: 70 }
            }));
        }
    })
});
