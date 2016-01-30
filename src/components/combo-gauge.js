DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var frameSprite = require('sprites/combo-gauge');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.position = options.position;
            this.sprite = frameSprite();

            this.multiplierDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: "#ffffff",
                position: { x: 1 + 7, y: this.position.y + this.sprite.height - 5 }
            });
            this.scoreDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: "#ffffff",
                position: { x: 1, y: this.position.y + this.sprite.height + 1 }
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.pointTotal = 0;
            this.multiplierDisplay.changeMessage("1x");
            this.scoreDisplay.changeMessage(this.pointTotal + "");

            this.addChild(this.multiplierDisplay);
            this.addChild(this.scoreDisplay);
        },

        addPoints: function (points) {
            this.pointTotal += points;
            this.scoreDisplay.changeMessage(this.pointTotal + "");
        },

        bumpCombo: function () {

        }
    });
});
