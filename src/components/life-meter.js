DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');
    var Gradients = require('helpers/gradients');
    var Sprite = require('models/sprite');

    var g = "#2D882D";
    var r = "#AA3939";
    var gradient = Gradients.GreenToRed;

    function getGradientColor(percentage) {
        var inverse = 1 - percentage;
        var ratio = inverse * gradient.length;
        var index = Math.floor(ratio);

        return gradient[ index ];
    }

    return DefineClass(GameObject, {
        index: 1,

        constructor: function (boundEntity, options) {
            this.super('constructor', arguments);

            options = options || {};

            this.entity = boundEntity;
            this.position = options.position || { x: 0, y: 0 };
            this.horizontal = !!options.horizontal;
            this.length = options.length || 10;
            this.width = options.width || 1;
            this.showBorder = !!options.showBorder;
            this.borderColor = options.borderColor || "#ffffff";
        },

        update: function () {
            if (this.entity.life !== this.currentLife || this.entity.maxLife !== this.maxLife) {
                this.currentLife = this.entity.life;
                this.maxLife = this.entity.maxLife;

                this.redrawMeter();
            }
        },

        redrawMeter: function () {
            var i, j;
            var percentage = this.currentLife / this.maxLife * 100;
            var meterColor = getGradientColor(this.currentLife / this.maxLife);

            var border = [];
            var colors = [];
            for (j = 0; j < this.width; j++) {
                colors.push([]);
            }

            for (i = this.length - 1; i >= 0; i--) {
                var color = null;
                if (i / this.length * 100 < percentage) {
                    color = meterColor;
                }

                for (j = 0; j < this.width; j++) {
                    colors[ j ].push(color);
                }

                border.push(this.borderColor);
            }

            if (this.showBorder) {
                if (this.width > 2) {
                    colors[ 0 ][ 0 ] = this.borderColor;
                    colors[ this.width - 1 ][ 0 ] = this.borderColor;
                    colors[ 0 ][ this.length - 1 ] = this.borderColor;
                    colors[ this.width - 1 ][ this.length - 1 ] = this.borderColor;
                }

                for (j = 0; j < this.width; j++) {
                    colors[ j ].push(this.borderColor);
                    colors[ j ].unshift(this.borderColor);
                }

                border.push(null);
                border.unshift(null);

                colors.unshift(border);
                colors.push(border);
            }

            this.sprite = new Sprite(colors);

            if (this.horizontal) {
                this.sprite.rotateRight();
            }
        }
    });
});
