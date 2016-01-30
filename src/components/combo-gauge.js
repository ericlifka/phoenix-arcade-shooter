DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var frameSprite = require('sprites/combo-gauge');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.position = options.position;
            this.sprite = frameSprite();

            this.pointTotal = 0;

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                color: "#ffffff",
                message: "1x",
                position: { x: 1 + 7, y: this.position.y + this.sprite.height - 5 }
            }));

            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                color: "#ffffff",
                message: this.pointTotal + "",
                position: { x: 1, y: this.position.y + this.sprite.height + 1}
            }));
        },

        addPoints: function (points) {
            this.pointTotal++;
            this.children[ 1 ].changeMessage(this.pointTotal + "");
        },

        bumpCombo: function () {

        }
    });
});
