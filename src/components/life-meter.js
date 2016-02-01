DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');
    var Gradients = require('helpers/gradients');
    var Sprite = require('models/sprite');

    var g = "#2D882D";
    var r = "#AA3939";
    var gradient = Gradients.GreenToRed;

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
            var percentage = this.currentLife / this.maxLife * 100;

            var colors = [];
            var border = [];
            for (var i = this.length - 1; i >= 0; i--) {
                if (i / this.length * 100 >= percentage) {
                    colors.push(null);
                }
                else {
                    colors.push(g);
                }

                border.push(this.borderColor);
            }

            var rows = [];
            for (var j = 0; j < this.width; j++) {
                rows.push(colors);
            }

            if (this.showBorder) {
                colors.push('#fff');
                colors.unshift('#fff');
                border.push(null);
                border.unshift(null);

                rows.unshift(border);
                rows.push(border);
            }

            this.sprite = new Sprite(rows);

            if (this.horizontal) {
                this.sprite.rotateRight();
            }
        }
    });
});
