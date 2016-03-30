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
            guns: { message: "Install wing guns", position: { x: 90, y: 95 } }
        },
        menuSelectorPositions: [ 49, 64, 79, 94 ],

        constructor: function (parent, game) {
            this.game = game;
            this.bank = game.bank;
            this.player = game.player;

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset', arguments);

            this.selectedMenuItem = 0;
            this.createMenuText();
            this.setCosts();
            this.createSelectorShip();

            this.addChild(new EventedInput({
                onUp: this.onUp.bind(this),
                onDown: this.onDown.bind(this),
                onSelect: this.onSelect.bind(this)
            }));
        },
        start: function () {
            this.player.preventInputControl = true;
            this.player.position.x = -10;
        },
        checkIfLevelComplete: function () {
            return false;
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
                    color: this.game.interfaceColor
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
            items.guns.cost = 1000;

            items.damage.costText.changeMessage("$" + items.damage.cost);
            items.health.costText.changeMessage("$" + items.health.cost);
            items.rate.costText.changeMessage("$" + items.rate.cost);
            items.guns.costText.changeMessage(player.wingGunsUnlocked ? "--" : "$" + items.guns.cost);

            if (items.health.cost > bank.value) {
                items.health.costText.updateColor("#777");
            }

            if (items.rate.cost > bank.value) {
                items.rate.costText.updateColor("#777");
            }

            if (items.damage.cost > bank.value) {
                items.damage.costText.updateColor("#777");
            }

            if (items.guns.cost > bank.value || player.wingGunsUnlocked) {
                items.guns.costText.updateColor("#777");
            }
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
                    default: return;
                }

                if (this.bank.value > selection.cost) {
                    this.bank.removeMoney(selection.cost);
                    this.chooseSelected();
                }
            }
        },
        chooseSelected: function () {
            this.selecting = true;
            this.timeSinceSelected = 0;

            var x1 = this.selectorShip.position.x + this.selectorShip.sprite.width;
            var y = this.selectorShip.position.y + Math.floor(this.selectorShip.sprite.height / 2);

            this.addChild(new Bullet(this, 2, { x: x1, y: y }, { x: 50, y: 0 }));
        },
        propagateSelection: function () {
            switch (this.selectedMenuItem) {
                case 0:
                    this.player.lifeUpgrades++;
                    this.player.maxLife++;
                    break;

                case 1: // rate
                    this.player.rateUpgrades++;
                    this.player.FIRE_RATE = Math.ceil(this.player.fireRate * .9);
                    break;

                case 2: // damage
                    this.player.damageUpgrades++;
                    break;

                case 3: // guns
                    this.player.wingGunsUnlocked = true;
                    break;

                default:
                    return;
            }

            this.setCosts();
            this.selecting = false;
        }
    });
});
