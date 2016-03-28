DefineModule('components/money-drop', function (require) {
    var GameObject = require('models/game-object');
    var dollarSprite = require('fonts/arcade')[ '$' ];

    return DefineClass(GameObject, {
        constructor: function (parent, position, velocity) {
            this.super('constructor', arguments);

            this.position = position;
            this.velocity = { x: 0, y: 50 };
            this.sprite = dollarSprite;
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x + this.sprite.width > this.parent.width
                || this.position.y + this.sprite.height > this.parent.height) {

                this.destroy();
            }
        }
    });
});
