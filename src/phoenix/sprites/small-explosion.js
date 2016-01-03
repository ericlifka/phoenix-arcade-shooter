DefineModule('phoenix/sprites/bullet-explosion', function (require) {
    var Animation = require('models/animation');
    var Sprite = require('models/sprite');

    var n = null;
    var y = "yellow";

    var frames = [

        new Sprite([
            [n, n, n],
            [n, y, n],
            [n, n, n]
        ]),
        new Sprite([
            [n, y, n],
            [y, n, y],
            [n, y, n]
        ]),
        new Sprite([
            [y, n, y],
            [n, n, n],
            [y, n, y]
        ])

    ];


    return function (parent) {
        return new Animation(parent, frames);
    }
});
