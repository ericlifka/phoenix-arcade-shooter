DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var frameSprite = require('sprites/combo-gauge');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.super('constructor', arguments);

            this.position = options.position;
            this.sprite = frameSprite();
        }
    });
});
