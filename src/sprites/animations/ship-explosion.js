DefineModule('sprites/animations/ship-explosion', function (require) {
    var Random = require('helpers/random');
    var smallExplosion = require('sprites/animations/small-explosion');
    var SpriteGroup = require('models/sprite-group');

    return function (offset) {
        offset = offset || { x: 0, y: 0 };

        return new SpriteGroup([
            {
                x: 0 + offset.x,
                y: Random.integer(0, 3) + offset.y,
                sprite: smallExplosion()
            },
            {
                x: Random.integer(3, 6) + offset.x,
                y: 0 + offset.y,
                sprite: smallExplosion()
            },
            {
                x: Random.integer(2, 4) + offset.x,
                y: Random.integer(4, 6) + offset.y,
                sprite: smallExplosion()
            }
        ]);
    }
});
