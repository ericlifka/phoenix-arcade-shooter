DefineModule('phoenix/animations/small-explosion', function (require) {
    var Animation = require('models/animation');
    var Sprite = require('models/sprite');

    var n = null;
    var y = "yellow";
    var o = "orange";
    var r = "red";

    var frames = [

        new Sprite([
            [n, n, n, n, n],
            [n, n, n, n, n],
            [n, n, r, n, n],
            [n, n, n, n, n],
            [n, n, n, n, n]
        ]),

        new Sprite([
            [n, n, n, n, n],
            [n, n, o, n, n],
            [n, o, o, o, n],
            [n, n, o, n, n],
            [n, n, n, n, n]
        ]),

        new Sprite([
            [n, n, y, n, n],
            [n, y, y, y, n],
            [y, y, y, y, y],
            [n, y, y, y, n],
            [n, n, y, n, n]
        ]),

        new Sprite([
            [n, n, y, n, n],
            [n, y, y, y, n],
            [y, y, n, y, y],
            [n, y, y, y, n],
            [n, n, y, n, n]
        ]),

        new Sprite([
            [n, n, y, n, n],
            [n, y, n, y, n],
            [y, n, n, n, y],
            [n, y, n, y, n],
            [n, n, y, n, n]
        ])
    ];


    return function () {
        return new Animation({
            frames: frames
        });
    }
});
