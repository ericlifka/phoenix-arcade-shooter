DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var frameSprite = require('sprites/combo-gauge');
    var Sprite = require('models/sprite');
    var TextDisplay = require('components/text-display');

    var gradient = [
        "#0AF448",
        "#0DF415",
        "#3BF40F",
        "#71F412",
        "#A6F414",
        "#DAF417",
        "#F4DC19",
        "#F4AB1C",
        "#F47A1E",
        "#F44B21",
        "#F52429"
    ];
    var gradientStep = 59 / gradient.length;

    return DefineClass(GameObject, {
        index: 1,

        constructor: function (parent, options) {
            this.position = options.position;
            this.sprite = frameSprite();

            this.multiplierDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: "#ffffff",
                index: 1,
                position: { x: 1 + 7, y: this.position.y + this.sprite.height - 5 }
            });
            this.scoreDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: "#ffffff",
                index: 1,
                position: { x: 1, y: this.position.y + this.sprite.height + 1 }
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.comboPoints = 0;
            this.pointTotal = 0;
            this.multiplierDisplay.changeMessage(pointsToMultiplierDisplay(this.comboPoints));
            this.scoreDisplay.changeMessage(padScoreText(this.pointTotal));

            this.updateGaugeHeight();
            this.addChild(this.multiplierDisplay);
            this.addChild(this.scoreDisplay);
        },

        renderToFrame: function (frame) {
            this.fillGaugeSprite.renderToFrame(frame, this.position.x + 1, this.position.y + 1, this.index - 1);

            this.super('renderToFrame', arguments);
        },

        addPoints: function (points) {
            this.pointTotal += points;
            this.scoreDisplay.changeMessage(padScoreText(this.pointTotal));
            this.updateGaugeHeight();
        },

        bumpCombo: function () {
            this.comboPoints++;
            this.multiplierDisplay.changeMessage(pointsToMultiplierDisplay(this.comboPoints));
        },

        updateGaugeHeight: function () {
            var pixels = [];
            for (var i = 0; i < 59; i++) {
                //if (i < this.comboPoints) {
                    pixels.unshift(getGradientPixel(i));
                //}
                //else {
                //    pixels.unshift(null);
                //}
            }
            this.fillGaugeSprite = new Sprite([
                pixels, pixels, pixels, pixels
            ]);
        }
    });

    function padScoreText(score) {
        score = score + "";
        switch (score.length) {
            case 0: score = "0" + score;
            case 1: score = "0" + score;
            case 2: score = "0" + score;
            case 3: score = "0" + score;
        }

        return score;
    }

    function pointsToMultiplierDisplay(points) {
        return "1x";
    }

    function getGradientPixel(pixelIndex) {
        if (pixelIndex < 0) pixelIndex = 0;
        if (pixelIndex > gradient.length - 1) pixelIndex = gradient.length - 1;

        var index = Math.floor(pixelIndex / gradientStep);

        return gradient[ index ];
    }
});
