DefineModule('levels/shop', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        index: 1,
        headerDef: { message: "Ship Upgrades", position: { x: 50, y: 10 } },
        menuItems: [
            { message: "10% faster Firing Rate", position: { x: 90, y: 90 } },
            { message: "+1 Bullet Damage", position: { x: 89, y: 105 } },
            { message: "+1 Ship Health", position: { x: 84, y: 120 } }
        ],

        constructor: function (parent, game) {
            this.game = game;
            this.bank = game.bank;
            this.player = game.player;

            this.super('constructor', arguments);
        },
        start: function () {
            this.player.preventInputControl = true;
            this.player.position.x = -10;

            this.addChild(new TextDisplay(this, {
                font: "arcade",
                message: this.headerDef.message,
                position: this.headerDef.position,
                color: this.game.interfaceColor
            }));

            this.menuItems.forEach(function (item) {
                this.addChild(new TextDisplay(this, {
                    font: "arcade-small",
                    message: item.message,
                    position: item.position,
                    color: this.game.interfaceColor
                }))
            }.bind(this));
        },
        checkIfLevelComplete: function () {
            return false;
        }
    });
});
