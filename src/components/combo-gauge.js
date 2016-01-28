DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var frameSprite = require('phoenix/sprites/combo-gauge');

    return DefineClass({
        constructor: function () {
            this.super('constructor', arguments);

            this.sprite = frameSprite();
        }
    });
});
