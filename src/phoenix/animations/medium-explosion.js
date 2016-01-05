DefineModule('phoenix/animations/medium-explosion', function (require) {
    var SpriteGroup = require('models/sprite-group');
    var smallExplosion = require('phoenix/animations/small-explosion');

    return function () {
        return new SpriteGroup([
            {
                x: 0, y: 0,
                sprite: smallExplosion()
            },
            {
                x: 5, y: 0,
                sprite: smallExplosion()
            },
            {
                x: 2, y: 5,
                sprite: smallExplosion()
            }
        ]);
    }
});
