DefineModule('ships/flying-saucer', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        BULLET_SPEED: 100,
        team: 1,
        index: 5,

        reset: function () {
            this.super('reset');
        }
    });
});
