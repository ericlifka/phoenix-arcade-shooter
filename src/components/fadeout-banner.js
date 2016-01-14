DefineModule('components/fadeout-banner', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    var colorGradient = [
        "rgb(255,255,255)",
        "rgb(226,226,232)",
        "rgb(171,171,189)",
        "rgb(142,142,165)",
        "rgb(114,113,142)",
        "rgb(85,84,119)",
        "rgb(58,57,97)",
        "rgb(29,27,74)",
        "rgb(1,0,51)"
    ];

    return DefineClass(GameObject, {
        constructor: function (parent, text, time) {
            this.super('constructor', arguments);

            this.text = text;
            this.interval = time / colorGradient.length;
        },

        start: function () {
            this.elapsedTime = 0;
            this.colorIndex = 0;

            this.textDisplay = new TextDisplay(this, {
                message: this.text,
                position: { x: 55, y: 50 },
                border: true,
                padding: 15,
                background: this.parent.game.FILL_COLOR,
                font: "arcade"
            });
            this.addChild(this.textDisplay);
        },

        update: function (dtime) {
            this.elapsedTime += dtime;

            if (this.elapsedTime > this.interval) {
                this.elapsedTime -= this.interval;
                this.colorIndex++;

                if (this.colorIndex > colorGradient.length) {
                    this.parent.removeChild(this);
                } else {
                    this.textDisplay.updateColor(colorGradient[ this.colorIndex ]);
                }
            }
        }
    });
});
