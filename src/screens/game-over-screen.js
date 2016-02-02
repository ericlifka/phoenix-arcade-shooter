DefineModule('screens/game-over-screen', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var padScoreDisplay = require('helpers/pad-score-display');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        headerDef: {
            font: "arcade",
            message: "GAME OVER",
            color: "red",
            border: 1,
            padding: 20,
            position: { x: 45, y: 45 }
        },
        subHeaderDef: {
            font: "arcade-small",
            message: "Final Score:",
            color: "red",
            position: { x: 66, y: 81 }
        },
        scoreDisplayDef: {
            font: "arcade-small",
            message: "0",
            color: "yellow",
            position: { x: 110, y: 81 }
        },

        constructor: function () {
            this.scoreDisplay = new TextDisplay(this, this.scoreDisplayDef);

            this.super('constructor', arguments);
        },

        reset: function () {
            this.super('reset');

            this.addChild(new TextDisplay(this, this.headerDef));
            this.addChild(new TextDisplay(this, this.subHeaderDef));
            this.addChild(this.scoreDisplay);

            this.addChild(new EventedInput({
                onSelect: this.onSelect.bind(this)
            }));
        },

        onSelect: function () {
            this.parent.reset();
        },

        setFinalScore: function (score) {
            this.scoreDisplay.changeMessage(padScoreDisplay(score));
        }
    })
});
