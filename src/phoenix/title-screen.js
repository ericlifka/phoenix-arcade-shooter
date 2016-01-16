DefineModule('phoenix/title-screen', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        constructor: function (parent) {
            this.super('constructor', arguments);

            this.addChild(new TextDisplay(this, {
                font: "phoenix",
                message: "PHOENIX",
                position: { x: 50, y: 30 }
            }));
        }
    });
});
