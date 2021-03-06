DefineModule('screens/title-screen', function (require) {
    var Bullet = require('components/bullet');
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');
    var ArrowShip = require('sprites/arrow-ship');

    return DefineClass(GameObject, {
        headerDef: { message: "PHOENIX", position: { x: 50, y: 30 } },
        menuItems: [
            { message: "New", position: { x: 90, y: 90 } },
            { message: "Load", position: { x: 89, y: 105 } },
            { message: "controls", position: { x: 84, y: 120 } }
        ],

        reset: function () {
            this.super('reset');

            this.selectedMenuItem = 0;
            this.timeSinceSelected = 0;
            this.selecting = false;

            this.addDisplayText();
            this.createShipSelectors();

            this.addChild(new EventedInput({
                onUp: this.onUp.bind(this),
                onDown: this.onDown.bind(this),
                onSelect: this.onSelect.bind(this)
            }));
        },

        addDisplayText: function () {
            this.addChild(new TextDisplay(this, {
                font: 'phoenix',
                message: this.headerDef.message,
                position: this.headerDef.position
            }));

            this.menuItems.forEach(function (item) {
                this.addChild(new TextDisplay(this, {
                    font: "arcade-small",
                    message: item.message,
                    position: item.position,
                    isPhysicalEntity: true
                }));
            }.bind(this));
        },

        createShipSelectors: function () {
            this.selectorShip = new GameObject();
            this.selectorRight = new GameObject();

            this.selectorShip.sprite = new ArrowShip();
            this.selectorRight.sprite = new ArrowShip().invertX();

            this.selectorShip.position = { x: 70, y: 0 };
            this.selectorRight.position = { x: 115, y: 0 };

            this.addChild(this.selectorShip);
            this.addChild(this.selectorRight);

            this.updateSelectorPosition();
        },

        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceSelected += dtime;
            if (this.selecting && this.timeSinceSelected > 595) {
                this.propagateSelection();
            }
        },

        onUp: function () {
            if (this.selectedMenuItem > 0 && !this.selecting) {
                this.selectedMenuItem--;
                this.updateSelectorPosition();
            }
        },

        onDown: function () {
            if (this.selectedMenuItem < this.menuItems.length - 1 && !this.selecting) {
                this.selectedMenuItem++;
                this.updateSelectorPosition();
            }
        },

        onSelect: function () {
            if (!this.selecting) {
                this.startGame();
            }
        },

        updateSelectorPosition: function () {
            var selectedY = this.menuItems[ this.selectedMenuItem ].position.y;

            this.selectorShip.position.y = selectedY;
            this.selectorRight.position.y = selectedY;
        },

        startGame: function () {
            this.selecting = true;
            this.timeSinceSelected = 0;

            var x1 = this.selectorShip.position.x + this.selectorShip.sprite.width;
            var x2 = this.selectorRight.position.x;
            var y = this.selectorShip.position.y + Math.floor(this.selectorShip.sprite.height / 2);

            this.addChild(new Bullet(this, {
                team: 2,
                position: { x: x1, y: y },
                velocity: { x: 50, y: 0 }
            }));
            this.addChild(new Bullet(this, {
                team: 3,
                position: { x: x2, y: y },
                velocity: { x: -50, y: 0}
            }));
        },

        propagateSelection: function () {
            this.destroy();
            switch (this.selectedMenuItem) {
                case 0:
                case 1:
                    this.parent.startNewGame();
                    break;
                case 2:
                    this.parent.showControlsScreen();
                    break;
                default:
                    console.error('Unsupported menu option');
            }

        }
    });
});
