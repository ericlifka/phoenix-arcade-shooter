DefineModule('phoenix/title-screen', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');
    var ArrowShip = require('phoenix/sprites/arrow-ship');

    return DefineClass(GameObject, {
        selectedMenuItem: 0,
        timeSinceChanged: 0,
        CHANGE_DELAY: 200,

        constructor: function (parent) {
            this.super('constructor', arguments);

            this.addChild(new TextDisplay(this, {
                font: "phoenix",
                message: "PHOENIX",
                position: { x: 50, y: 30 }
            }));

            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: "New",
                position: { x: 90, y: 90 }
            }));

            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                message: "Load",
                position: { x: 90, y: 105 }
            }));

            this.selectorLeft = new GameObject();
            this.selectorRight = new GameObject();

            this.selectorLeft.sprite = new ArrowShip();
            this.selectorRight.sprite = new ArrowShip().invertX();

            this.selectorLeft.position = { x: 70, y: 90 };
            this.selectorRight.position = { x: 115, y: 90 };

            this.addChild(this.selectorLeft);
            this.addChild(this.selectorRight);
        },

        processInput: function (input) {
            if (this.timeSinceChanged > this.CHANGE_DELAY) {
                if (input.menuSelect) {
                    this.timeSinceChanged = 0;
                    this.chooseSelected();
                }

                if (Math.abs(input.movementVector.y) > 0.6) {
                    this.selectedMenuItem++;
                    this.timeSinceChanged = 0;

                    if (this.selectedMenuItem > 1) {
                        this.selectedMenuItem = 0;
                    }
                }
            }

            this.updateSelectorPosition();
        },

        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceChanged += dtime;
        },

        updateSelectorPosition: function () {
            if (this.selectedMenuItem === 0) {
                this.selectorLeft.position.y = 90;
                this.selectorRight.position.y = 90;
            }
            else {
                this.selectorLeft.position.y = 105;
                this.selectorRight.position.y = 105;
            }
        },

        chooseSelected: function () {
            console.log('selected item: ', this.selectedMenuItem);
        }
    });
});