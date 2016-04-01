DefineModule('screens/game-over-screen', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var padScoreDisplay = require('helpers/pad-score-display');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        resultMessage: {
            font: "arcade",
            message: "GAME OVER",
            position: { x: 67, y: 53 }
        },
        headerDef: {
            font: "arcade-small",
            border: 1,
            padding: 20,
            message: "< hit enter >",
            position: { x: 55, y: 45 }
        },
        subHeaderDef: {
            font: "arcade-small",
            message: "Final Score:",
            position: { x: 68, y: 77 }
        },
        scoreDisplayDef: {
            font: "arcade-small",
            message: "0",
            color: "yellow",
            position: { x: 111, y: 77 }
        },

        constructor: function () {
            this.result = new TextDisplay(this, this.resultMessage);
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

            this.addChild(this.result);
            this.addChild(this.header);
            this.addChild(this.subHeader);
            this.addChild(this.scoreDisplay);

            this.addChild(this.inputEvents);
            this.inputEvents.reset();
        },

        onStart: function () {
            this.parent.finishGame();
        },

        setResult: function (result) {
            if (result === "win") {
                this.header.updateColor("green");
                this.result.updateColor("green");
                this.subHeader.updateColor("green");
                this.result.changeMessage("YOU WIN!");
            } else if (result === "loss") {
                this.header.updateColor("red");
                this.result.updateColor("red");
                this.subHeader.updateColor("red");
                this.result.changeMessage("GAME OVER");
            }
        },

        setFinalScore: function (score) {
            this.scoreDisplay.changeMessage(padScoreDisplay(score));
        }
    })
});
