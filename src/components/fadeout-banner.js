DefineModule('components/fadeout-banner', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    var colorGradient = [
        "#000031",
        "#111131",
        "#222231",
        "#333331",
        "#444431",
        "#555531",
        "#666631",
        "#777731",
        "#888831",
        "#999931",
        "#aaaa31",
        "#bbbb31",
        "#cccc31",
        "#dddd31",
        "#eeee31",
        "#ffff31",
        "#ffffff"
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
