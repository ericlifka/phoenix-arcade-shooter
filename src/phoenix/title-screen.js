DefineModule('phoenix/title-screen', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');
    var ArrowShip = require('phoenix/sprites/arrow-ship');

    return DefineClass(GameObject, {
        selectedMenuItem: 0,

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
        }
    });
});
