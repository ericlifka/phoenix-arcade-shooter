DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var Gradients = require('helpers/gradients');
    var frameSprite = require('sprites/combo-gauge');
    var padScoreDisplay = require('helpers/pad-score-display');
    var Sprite = require('models/sprite');
    var TextDisplay = require('components/text-display');

    //var gradient = Gradients.GreenToRed;
    //var gradientStep = 60 / gradient.length;

    return DefineClass(GameObject, {
        index: 1,

        constructor: function (parent, options) {
            this.position = options.position;
            this.color = options.color || "#ffffff";
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

        getScore: function () {
            return this.pointTotal;
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
                    pixels.unshift(Gradients.colorAtPercent(Gradients.GreenToRed, 1 - i / 59));
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
            this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
        }
    });

    //function getGradientPixel(pixelIndex) {
    //    var index = Math.floor(pixelIndex / gradientStep);
    //    if (index < 0) index = 0;
    //    if (index > gradient.length - 1) index = gradient.length - 1;
    //
    //    return gradient[ index ];
    //}
});
