DefineModule('phoenix/enemy-ship', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('phoenix/sprites/dagger-ship');

    return DefineClass(GameObject, {
        constructor: function () {
            this.super('constructor', arguments);

            this.sprite = shipSprite().rotateLeft();
            this.position = { x: 0, y: 0 };
        }
    });
});
