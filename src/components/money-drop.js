DefineModule('components/money-drop', function (require) {
    var GameObject = require('models/game-object');
    var dollarSprite = require('fonts/arcade')[ '$' ];

    return DefineClass(GameObject, {
        constructor: function (parent, position, velocity) {
            this.super('constructor', arguments);

            this.position = position;
            this.velocity = velocity;
            this.sprite = dollarSprite;
        }
    });
});
