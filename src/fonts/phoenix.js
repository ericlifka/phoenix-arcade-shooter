DefineModule('fonts/phoenix', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 7,
            height: 7,
            lineHeight: 11,
            letterSpacing: 1
        },
        P: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,w,w,w,n,n,n],
            [n,w,w,n,n,n,n]
        ]),
        H: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,n,w,n,n,n],
            [n,n,n,w,n,n,n],
            [n,n,n,w,n,n,n],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w]
        ]),
        O: new Sprite([
            [n,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [n,w,w,w,w,w,n]
        ]),
        E: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,n,n,n,w]
        ]),
        N: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,w,w,n,n,n,n],
            [n,n,w,w,n,n,n],
            [n,n,n,w,w,n,n],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w]
        ]),
        I: new Sprite([
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w]
        ]),
        X: new Sprite([
            [w,n,n,n,n,w,w],
            [w,w,n,n,w,w,n],
            [n,w,w,w,w,n,n],
            [n,n,w,w,n,n,n],
            [n,w,w,w,w,n,n],
            [w,w,n,n,w,w,n],
            [w,n,n,n,n,w,w]
        ])
    };
});
