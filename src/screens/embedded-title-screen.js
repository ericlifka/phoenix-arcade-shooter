DefineModule('screens/embedded-title-screen', function (require) {
    var Bullet = require('components/bullet');
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');
    var ArrowShip = require('sprites/arrow-ship');

    return DefineClass(GameObject, {
        reset: function () {
            this.super('reset');

            this.selectedMenuItem = 0;
            this.timeSinceSelected = 0;
            this.selecting = false;

            this.addDisplayText();
            this.createShipSelectors();

            this.addChild(new EventedInput({
                onSelect: this.onSelect.bind(this)
            }));
        },

        addDisplayText: function () {
            this.addChild(new TextDisplay(this, {
                font: 'phoenix',
                message: "PHOENIX",
                position: { x: 50, y: 30 }
            }));

            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: "Start",
                position: { x: 90, y: 80 },
                isPhysicalEntity: true
            }));

            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: "WASD - move ship",
                position: { x: 5, y: 120 }
            }));
            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: "SPACE - fire gun",
                position: { x: 5, y: 130 }
            }));
            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: "ENTER - pause",
                position: { x: 5, y: 140 }
            }));
        },

        createShipSelectors: function () {
            this.selectorShip = new GameObject();
            this.selectorRight = new GameObject();

            this.selectorShip.sprite = new ArrowShip();
            this.selectorRight.sprite = new ArrowShip().invertX();

            this.selectorShip.position = { x: 70, y: 80 };
            this.selectorRight.position = { x: 120, y: 80 };

            this.addChild(this.selectorShip);
            this.addChild(this.selectorRight);
        },

        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceSelected += dtime;
            if (this.selecting && this.timeSinceSelected > 595) {
                this.propagateSelection();
            }
        },

        onSelect: function () {
            if (!this.selecting) {
                this.startGame();
            }
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
            this.parent.startNewGame();
            this.destroy();
        }
    });
});
