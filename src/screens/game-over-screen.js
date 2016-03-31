DefineModule('screens/game-over-screen', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var padScoreDisplay = require('helpers/pad-score-display');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        headerDef: {
            font: "arcade",
            border: 1,
            padding: 20,
            position: { x: 45, y: 45 }
        },
        subHeaderDef: {
            font: "arcade-small",
            message: "Final Score:",
            position: { x: 66, y: 81 }
        },
        scoreDisplayDef: {
            font: "arcade-small",
            message: "0",
            color: "yellow",
            position: { x: 110, y: 81 }
        },

        constructor: function () {
            this.header = new TextDisplay(this, this.headerDef);
            this.subHeader = new TextDisplay(this, this.subHeaderDef);
            this.scoreDisplay = new TextDisplay(this, this.scoreDisplayDef);

            this.inputEvents = new EventedInput({
                onStart: this.onStart.bind(this)
            });

            this.super('constructor', arguments);
        },

        reset: function () {
            this.super('reset');

            this.addChild(this.header);
            this.addChild(this.subHeader);
            this.addChild(this.scoreDisplay);

            this.addChild(this.inputEvents);
        },

        onStart: function () {
            this.parent.finishGame();
        },

        setResult: function (result) {
            if (result === "win") {
                this.header.updateColor("green");
                this.subHeader.updateColor("green");
                this.header.changeMessage("YOU WIN!");
            } else if (result === "loss") {
                this.header.updateColor("red");
                this.subHeader.updateColor("red");
                this.header.changeMessage("GAME OVER");
            }
        },

        setFinalScore: function (score) {
            this.scoreDisplay.changeMessage(padScoreDisplay(score));
        }
    })
});
