DefineModule('levels/shop', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        index: 1,
        headerDef: { message: "Ship Upgrades", position: { x: 50, y: 10 } },
        menuItems: {
            health: { message: "+1 Ship Health", position: { x: 90, y: 50 } },
            rate: { message: "10% faster Firing Rate", position: { x: 90, y: 65 } },
            damage: { message: "+1 Bullet Damage", position: { x: 90, y: 80 } },
            guns: { message: "Add wing guns", position: { x: 90, y: 95 } }
        },

        constructor: function (parent, game) {
            this.game = game;
            this.bank = game.bank;
            this.player = game.player;

            this.titleText = new TextDisplay(this, {
                font: "arcade",
                message: this.headerDef.message,
                position: this.headerDef.position,
                color: this.game.interfaceColor
            });

            Object.keys(this.menuItems).forEach(function (key) {
                var item = this.menuItems[ key ];
                item.description = new TextDisplay(this, {
                    font: "arcade-small",
                    message: item.message,
                    position: item.position,
                    color: this.game.interfaceColor
                });
                item.costText = new TextDisplay(this, {
                    font: "arcade-small",
                    message: '',
                    position: { x: item.position.x - 20, y: item.position.y },
                    color: this.game.interfaceColor
                });
            }.bind(this));

            this.setCosts();

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset', arguments);

            this.addChild(this.titleText);
            Object.keys(this.menuItems).forEach(function (key) {
                var item = this.menuItems[ key ];
                this.addChild(item.description);
                this.addChild(item.costText);
            }.bind(this));
        },
        start: function () {
            this.player.preventInputControl = true;
            this.player.position.x = -10;
        },
        checkIfLevelComplete: function () {
            return false;
        },

        setCosts: function () {
            this.menuItems.damage.cost = this.player.damageUpgrades * 200;
            this.menuItems.health.cost = this.player.lifeUpgrades * 50;
            this.menuItems.rate.cost  = this.player.rateUpgrades * 100;
            this.menuItems.guns.cost = 1000;

            this.menuItems.damage.costText.changeMessage("$" + this.menuItems.damage.cost);
            this.menuItems.health.costText.changeMessage("$" + this.menuItems.health.cost);
            this.menuItems.rate.costText.changeMessage("$" + this.menuItems.rate.cost);
            this.menuItems.guns.costText.changeMessage(this.player.wingGunsUnlocked ? "--" : "$" + this.menuItems.guns.cost);
        }
    });
});
