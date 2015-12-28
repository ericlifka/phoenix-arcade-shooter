DefineModule('phoenix/enemy-ship', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('phoenix/sprites/arrow-ship');

    return DefineClass(GameObject, {
        constructor: function () {
            this.super('constructor', arguments);

            this.sprite = shipSprite().rotateRight();
            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };
        }
    });
});
