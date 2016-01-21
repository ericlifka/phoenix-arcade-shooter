DefineModule('phoenix/animations/muzzle-flash', function (require) {
    var Animation = require('models/animation');
    var Sprite = require('models/sprite');

    var y = "yellow";
    var o = "orange";
    var r = "red";

    var frames = [
        new Sprite([
            [ r, r ]
        ]),
        new Sprite([
            [ o, o ]
        ]),
        new Sprite([
            [ y, y ]
        ])
    ];

    return function () {
        return new Animation({
            frames: frames,
            millisPerFrame: 50
        });
    }
});
