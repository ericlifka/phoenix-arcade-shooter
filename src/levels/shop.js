DefineModule('levels/shop', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        constructor: function (parent, game) {
            this.bank = game.bank;

            this.titleText = new TextDisplay(this, {
                font: "arcade",
                message: "Ship Upgrades",
                color: game.interfaceColor,
                position: { x: 20, y: 10 }
            });

            this.super('constructor', arguments);
        },
        start: function () {
            this.addChild(this.titleText);
        },
        checkIfLevelComplete: function () {
            return false;
        }
    });
});
