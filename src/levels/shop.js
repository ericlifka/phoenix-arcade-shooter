DefineModule('levels/shop', function (require) {
    var ArrowShip = require('sprites/arrow-ship');
    var Bullet = require('components/bullet');
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        isShop: true,
        index: 1,
        headerDef: { message: "Ship Upgrades", position: { x: 50, y: 10 } },
        menuItems: {
            health: { message: "+1 Ship Health", position: { x: 90, y: 50 } },
            rate: { message: "10% faster Firing Rate", position: { x: 90, y: 65 } },
            damage: { message: "+1 Bullet Damage", position: { x: 90, y: 80 } },
            guns: { message: "Install wing guns", position: { x: 90, y: 95 } },
            leave: { message: "Leave Shop", position: { x: 60, y: 110 } }
        },
        menuSelectorPositions: [ 49, 64, 79, 94, 109 ],
        disabledColor: "#777",

        constructor: function (parent, game) {
            this.game = game;
            this.bank = game.bank;
            this.player = game.player;

            this.input = new EventedInput({
                onUp: this.onUp.bind(this),
                onDown: this.onDown.bind(this),
                onSelect: this.onSelect.bind(this)
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset', arguments);

            this.input.reset();
            this.isDoneShopping = false;
            this.selectedMenuItem = 0;
            this.createMenuText();
            this.setCosts();
            this.createSelectorShip();

            this.addChild(this.input);
        },
        start: function () {
            this.input.reset();
            this.isDoneShopping = false;
            this.setCosts();
        },
        checkIfLevelComplete: function () {
            return this.isDoneShopping;
        },
        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceSelected += dtime;
            if (this.selecting && this.timeSinceSelected > 595) {
                this.propagateSelection();
            }
        },

        createMenuText: function () {
            this.titleText = new TextDisplay(this, {
                font: "arcade",
                message: this.headerDef.message,
                position: this.headerDef.position,
                color: this.game.interfaceColor
            });
            this.addChild(this.titleText);

            Object.keys(this.menuItems).forEach(function (key) {
                var item = this.menuItems[ key ];

                item.description = new TextDisplay(this, {
                    font: "arcade-small",
                    message: item.message,
                    position: item.position,
                    color: this.game.interfaceColor,
                    isPhysicalEntity: true
                });
                this.addChild(item.description);

                item.costText = new TextDisplay(this, {
                    font: "arcade-small",
                    message: '',
                    position: { x: item.position.x - 30, y: item.position.y },
                    color: this.game.interfaceColor,
                    isPhysicalEntity: true
                });
                this.addChild(item.costText);
            }.bind(this));
        },
        setCosts: function () {
            var items = this.menuItems;
            var player = this.player;
            var bank = this.bank;

            items.health.cost = 10 + player.lifeUpgrades * 10;
            items.rate.cost = 50 + player.rateUpgrades * 50;
            items.damage.cost = 100 + player.damageUpgrades * 100;
            items.guns.cost = player.wingGunsUnlocked ? -1 : 1000;

            items.damage.costText.changeMessage("$" + items.damage.cost);
            items.health.costText.changeMessage("$" + items.health.cost);
            items.rate.costText.changeMessage("$" + items.rate.cost);
            items.guns.costText.changeMessage(player.wingGunsUnlocked ? "--" : "$" + items.guns.cost);
            items.leave.description.changeMessage(items.leave.message);

            items.health.costText.updateColor(items.health.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
            items.rate.costText.updateColor(items.rate.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
            items.damage.costText.updateColor(items.damage.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
            items.guns.costText.updateColor(items.guns.cost > bank.value || player.wingGunsUnlocked ? this.disabledColor : this.game.interfaceColor);
        },
        createSelectorShip: function () {
            this.selectorShip = new GameObject();
            this.selectorShip.sprite = new ArrowShip();
            this.selectorShip.position = { x: 40, y: 0 };
            this.addChild(this.selectorShip);

            this.updateSelectorPosition();
        },
        updateSelectorPosition: function () {
            this.selectorShip.position.y = this.menuSelectorPositions[ this.selectedMenuItem ];
        },
        onUp: function () {
            if (!this.selecting && this.selectedMenuItem > 0) {
                this.selectedMenuItem--;
                this.updateSelectorPosition();
            }
        },
        onDown: function () {
            if (!this.selecting && this.selectedMenuItem < this.menuSelectorPositions.length - 1) {
                this.selectedMenuItem++;
                this.updateSelectorPosition();
            }
        },
        onSelect: function () {
            if (!this.selecting) {
                var selection;
                switch (this.selectedMenuItem) {
                    case 0: selection = this.menuItems.health; break;
                    case 1: selection = this.menuItems.rate; break;
                    case 2: selection = this.menuItems.damage; break;
                    case 3: selection = this.menuItems.guns; break;
                    case 4: this.startGame(); return;
                    default: return;
                }

                if (this.bank.value >= selection.cost && selection.cost !== -1) {
                    this.bank.removeMoney(selection.cost);
                    this.startGame();
                }
            }
        },
        startGame: function () {
            this.selecting = true;
            this.timeSinceSelected = 0;

            var x1 = this.selectorShip.position.x + this.selectorShip.sprite.width;
            var y = this.selectorShip.position.y + Math.floor(this.selectorShip.sprite.height / 2);

            this.addChild(new Bullet(this, {
                team: 2,
                position: { x: x1, y: y },
                velocity: { x: 50, y: 0 }
            }));
        },
        propagateSelection: function () {
            switch (this.selectedMenuItem) {
                case 0:
                    this.player.lifeUpgrades++;
                    this.player.maxLife++;
                    break;

                case 1: // rate
                    this.player.rateUpgrades++;
                    this.player.FIRE_RATE = Math.ceil(this.player.FIRE_RATE * .9);
                    break;

                case 2: // damage
                    this.player.damageUpgrades++;
                    break;

                case 3: // guns
                    this.player.addWingGuns();
                    break;

                case 4: // done shopping
                    this.isDoneShopping = true;
                    break;
            }

            this.setCosts();
            this.selecting = false;
        }
    });
});
