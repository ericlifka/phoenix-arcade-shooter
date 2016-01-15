DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');
    var Sprite = require('models/sprite');
    var g = "#2D882D";
    var r = "#AA3939";

    return DefineClass(GameObject, {
        meterSize: 20,

        constructor: function (parent, boundEntity, position) {
            this.super('constructor', arguments);

            this.entity = boundEntity;
            this.position = position;


            //this.currentLife = this.entity.life;
            //this.maxLife = this.entity.maxLife;
            //
            //this.sprite = new Sprite([
            //    [ g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g ],
            //    [ g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g ]
            //]);
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

            for (var i = this.meterSize - 1; i >= 0; i--) {
                if (i / this.meterSize * 100 >= percentage) {
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
