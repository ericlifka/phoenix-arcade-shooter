DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var frameSprite = require('sprites/combo-gauge');
    var Sprite = require('models/sprite');
    var TextDisplay = require('components/text-display');

    var gradient = [ "#0AF448", "#0BF440", "#0BF437", "#0CF42E", "#0CF426",
        "#0DF41D", "#0DF415", "#0FF40D", "#18F40E", "#22F40E", "#2BF40F",
        "#34F40F", "#3DF410", "#47F410", "#50F410", "#59F411", "#62F411",
        "#6BF412", "#74F412", "#7DF413", "#86F413", "#8FF413", "#98F414",
        "#A1F414", "#AAF415", "#B2F415", "#BBF415", "#C4F416", "#CDF416",
        "#D5F417", "#DEF417", "#E7F418", "#EFF418", "#F4F018", "#F4E819",
        "#F4DF19", "#F4D71A", "#F4CE1A", "#F4C61B", "#F4BE1B", "#F4B51B",
        "#F4AD1C", "#F4A51C", "#F49D1D", "#F4941D", "#F48C1E", "#F4841E",
        "#F47C1E", "#F4741F", "#F46C1F", "#F46420", "#F45C20", "#F45421",
        "#F44C21", "#F44421", "#F43D22", "#F43522", "#F42D23", "#F42523",
        "#F52429" ];
    var gradientStep = 60 / gradient.length;

    return DefineClass(GameObject, {
        index: 1,
        color: "#ffd",

        constructor: function (parent, options) {
            this.position = options.position;
            this.sprite = frameSprite().applyColor(this.color);

            this.multiplierDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: this.color,
                index: 1,
                position: { x: 1 + 7, y: this.position.y + this.sprite.height - 5 }
            });
            this.scoreDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: this.color,
                index: 1,
                position: { x: 1, y: this.position.y + this.sprite.height + 1 }
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.comboPoints = 0;
            this.pointTotal = 0;

            this.updateMultiplier();
            this.updateGaugeHeight();
            this.updateScore();

            this.addChild(this.multiplierDisplay);
            this.addChild(this.scoreDisplay);
        },

        renderToFrame: function (frame) {
            this.fillGaugeSprite.renderToFrame(frame, this.position.x + 1, this.position.y + 1, this.index - 1);

            this.super('renderToFrame', arguments);
        },

        addPoints: function (points) {
            this.pointTotal += this.pointMultiplier * points;
            this.updateScore();
        },

        bumpCombo: function () {
            this.comboPoints++;
            this.updateMultiplier();
            this.updateGaugeHeight();
        },

        clearCombo: function () {
            this.comboPoints = 0;
            this.updateMultiplier();
            this.updateGaugeHeight();
        },

        updateGaugeHeight: function () {
            var pixels = [];
            for (var i = 0; i < 59; i++) {
                if (i < this.comboPoints) {
                    pixels.unshift(getGradientPixel(i));
                }
                else {
                    pixels.unshift(null);
                }
            }

            this.fillGaugeSprite = new Sprite([
                pixels, pixels, pixels, pixels
            ]);
        },

        updateMultiplier: function () {
            if (this.comboPoints >= 59) {
                this.pointMultiplier = 6;
            }
            else if (this.comboPoints >= 48) {
                this.pointMultiplier = 5;
            }
            else if (this.comboPoints >= 36) {
                this.pointMultiplier = 4;
            }
            else if (this.comboPoints >= 24 ) {
                this.pointMultiplier = 3;
            }
            else if (this.comboPoints >= 12) {
                this.pointMultiplier = 2;
            }
            else {
                this.pointMultiplier = 1;
            }

            this.multiplierDisplay.changeMessage(this.pointMultiplier + "x");
        },

        updateScore: function () {
            this.scoreDisplay.changeMessage(padScoreText(this.pointTotal));
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

    function getGradientPixel(pixelIndex) {
        var index = Math.floor(pixelIndex / gradientStep);
        if (index < 0) index = 0;
        if (index > gradient.length - 1) index = gradient.length - 1;

        return gradient[ index ];
    }
});
