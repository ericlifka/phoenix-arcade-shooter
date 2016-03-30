DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');
    var Gradients = require('helpers/gradients');
    var Sprite = require('models/sprite');

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
            this.scale = options.scale;
            this.showBorder = !!options.showBorder;
            this.borderColor = options.borderColor || "#ffffff";
        },

        update: function () {
            if (this.entity.life !== this.currentLife || this.entity.maxLife !== this.maxLife) {
                this.currentLife = this.entity.life;
                this.maxLife = this.entity.maxLife;

                if (this.scale) {
                    this.length = this.maxLife * this.scale;
                    if (this.length > 70) {
                        // this just applies to the player's health if they get so many upgrades
                        // it would overflow the screen, manually set lengths will always honor them.
                        this.length = 70;
                    }
                }

                this.redrawMeter();
            }
        },

        redrawMeter: function () {
            var colors = this.buildSpriteColorArray();

            if (this.showBorder) {
                this.addBorderToColorArray(colors);
            }

            this.sprite = new Sprite(colors);

            if (this.horizontal) {
                this.sprite.rotateRight();
            }
        },

        buildSpriteColorArray: function () {
            var percentage = this.currentLife / this.maxLife * 100;
            var meterColor = Gradients.colorAtPercent(Gradients.GreenToRed, this.currentLife / this.maxLife);
            var colors = this.buildEmptySpriteColorArray();

            for (var i = this.length - 1; i >= 0; i--) {
                var color = null;
                if (i / this.length * 100 < percentage) {
                    color = meterColor;
                }

                colors.forEach(function (colorArray) {
                    colorArray.push(color);
                });
            }

            return colors;
        },

        buildEmptySpriteColorArray: function() {
            var colors = [];
            for (var j = 0; j < this.width; j++) {
                colors.push([]);
            }
            return colors;
        },

        addBorderToColorArray: function (colors) {
            this.addBezelPixelsToBorder(colors);
            this.addBorderEnds(colors);
            this.addBorderEdges(colors);
        },

        addBezelPixelsToBorder: function (colors) {
            if (this.width > 2) {
                colors[ 0 ][ 0 ] = this.borderColor;
                colors[ this.width - 1 ][ 0 ] = this.borderColor;
                colors[ 0 ][ this.length - 1 ] = this.borderColor;
                colors[ this.width - 1 ][ this.length - 1 ] = this.borderColor;
            }
        },

        addBorderEnds: function (colors) {
            for (var j = 0; j < this.width; j++) {
                colors[ j ].push(this.borderColor);
                colors[ j ].unshift(this.borderColor);
            }
        },

        addBorderEdges: function (colors) {
            var border = [ null ];
            for (var i = 0; i < this.length; i++) {
                border.push(this.borderColor);
            }
            border.push(null);

            colors.push(border);
            colors.unshift(border);
        }
    });
});
