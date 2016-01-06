DefineModule('phoenix/animations/ship-explosion', function (require) {
    var Random = require('helpers/random');
    var smallExplosion = require('phoenix/animations/small-explosion');
    var SpriteGroup = require('models/sprite-group');

    return function () {
        return new SpriteGroup([
            {
                x: 0,
                y: Random.integer(0, 3),
                sprite: smallExplosion()
            },
            {
                x: Random.integer(3, 6),
                y: 0,
                sprite: smallExplosion()
            },
            {
                x: Random.integer(2, 4),
                y: Random.integer(4, 6),
                sprite: smallExplosion()
            }
        ]);
    }
});
