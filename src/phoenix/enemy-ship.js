DefineModule('phoenix/define-ship', function (require) {
    var playerShipSprite = require('phoenix/sprites/player-ship');

    return DefineClass(GameObject, {
        constructor: function () {
            this.super('constructor', arguments);

            this.sprite = playerShipSprite().rotateLeft();
            this.position = { x: 0, y: 0 };
        }
    });
});
