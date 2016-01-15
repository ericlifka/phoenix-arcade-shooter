DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');
    var Sprite = require('models/sprite');
    var g = "#2D882D";

    return DefineClass(GameObject, {
        constructor: function (parent, boundEntity, position) {
            this.super('constructor', arguments);

            this.entity = boundEntity;
            this.position = position;

            this.sprite = new Sprite([
                [g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g],
                [g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g]
            ]);
        },

        update: function () {

        }
    });
});
