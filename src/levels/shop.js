DefineModule('levels/shop', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        constructor: function (parent, game) {
            this.bank = game.bank;
            this.player = game.player;

            this.titleText = new TextDisplay(this, {
                font: "arcade",
                message: "Ship Upgrades",
                color: game.interfaceColor,
                position: { x: 50, y: 10 }
            });

            this.super('constructor', arguments);
        },
        start: function () {
            this.addChild(this.titleText);
            this.player.preventInputControl = true;
            this.player.position.x = -10;
        },
        checkIfLevelComplete: function () {
            return false;
        }
    });
});
