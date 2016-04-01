DefineModule('components/bank', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        index: 1,

        constructor: function (parent, options) {
            options = options || { };
            this.anchorPoint = options.position; // this text expands from the right, so the position has to be dynamic
            this.position = { x: 0, y: this.anchorPoint.y };
            this.color = options.color || "#ffffff";

            this.valueDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: this.color,
                index: 1,
                position: { x: this.position.x, y: this.position.y }
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.addChild(this.valueDisplay);
            this.value = 0;
            this.updateDisplay();
        },
        addMoney: function (value) {
            this.value += value;
            this.updateDisplay();
        },
        removeMoney: function (amount) {
            this.value -= amount;
            this.updateDisplay();
        },
        updateDisplay: function () {
            this.valueDisplay.changeMessage("$" + this.value + ".0");
            var width = this.valueDisplay.width;
            this.position.x = this.valueDisplay.position.x = this.anchorPoint.x - width;
        }
    });
});
