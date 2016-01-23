DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');
    var Sprite = require('models/sprite');
    var g = "#2D882D";
    var r = "#AA3939";

    return DefineClass(GameObject, {
        constructor: function (boundEntity, options) {
            options = options || {};

            this.entity = boundEntity;
            this.position = options.position || { x: 0, y: 0 };
            this.horizontal = !!options.horizontal;
            this.length = options.length || 10;
            this.width = options.width || 1;
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

            for (var i = this.length - 1; i >= 0; i--) {
                if (i / this.length * 100 >= percentage) {
                    colors.push(r);
                }
                else {
                    colors.push(g);
                }
            }

            this.sprite = new Sprite([ colors, colors ]);
        }
    });
});
