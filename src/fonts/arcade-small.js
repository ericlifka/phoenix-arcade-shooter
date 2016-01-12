DefineModule('fonts/arcade-small', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 3,
            height: 5,
            lineHeight: 7,
            letterSpacing: 1,
            credit: "me"
        },
        A: new Sprite([
            [n,w,w,w,w],
            [w,n,w,n,n],
            [n,w,w,w,w]
        ]),
        B: new Sprite([
            [w,w,w,w,w],
            [w,n,w,n,w],
            [n,w,n,w,n]
        ]),
        C: new Sprite([
            [n,w,w,w,n],
            [w,n,n,n,w],
            [n,w,n,w,n]
        ]),
        D: new Sprite([
            [w,w,w,w,w],
            [w,n,n,n,w],
            [n,w,w,w,n]
        ]),
        E: new Sprite([
            [w,w,w,w,w],
            [w,n,w,n,w],
            [w,n,n,n,w]
        ]),
        F: new Sprite([
            [w,w,w,w,w],
            [w,n,w,n,n],
            [w,n,n,n,n]
        ]),
        G: new Sprite([
            [n,w,w,w,n],
            [w,n,n,n,w],
            [w,n,n,w,w]
        ]),
        H: new Sprite([
            [w,w,w,w,w],
            [n,n,w,n,n],
            [w,w,w,w,w]
        ]),
        I: new Sprite([
            [w,n,n,n,w],
            [w,w,w,w,w],
            [w,n,n,n,w]
        ]),
        J: new Sprite([
            [n,n,n,w,n],
            [n,n,n,n,w],
            [w,w,w,w,n]
        ]),
        K: new Sprite([
            [w,w,w,w,w],
            [n,n,w,n,n],
            [n,w,n,w,w]
        ]),
        L: new Sprite([
            [w,w,w,w,w],
            [n,n,n,n,w],
            [n,n,n,n,w]
        ]),
        M: new Sprite([
            [w,w,w,w,w],
            [n,w,n,n,n],
            [n,n,w,n,n],
            [n,w,n,n,n],
            [w,w,w,w,w]
        ]),
        N: new Sprite([
            [w,w,w,w,w],
            [n,w,n,n,n],
            [n,n,w,n,n],
            [w,w,w,w,w]
        ]),
        O: new Sprite([
            [n,w,w,w,n],
            [w,n,n,n,w],
            [n,w,w,w,n]
        ]),
        P: new Sprite([
            [w,w,w,w,w],
            [w,n,w,n,n],
            [n,w,n,n,n]
        ]),
        Q: new Sprite([
            [n,w,w,w,n],
            [w,n,n,n,w],
            [n,w,w,w,w]
        ]),
        R: new Sprite([
            [w,w,w,w,w],
            [w,n,w,n,n],
            [n,w,n,w,w]
        ]),
        S: new Sprite([
            [n,w,n,n,w],
            [w,n,w,n,w],
            [w,n,n,w,n]
        ]),
        T: new Sprite([
            [w,n,n,n,n],
            [w,w,w,w,w],
            [w,n,n,n,n]
        ]),
        U: new Sprite([
            [w,w,w,w,n],
            [n,n,n,n,w],
            [w,w,w,w,w]
        ]),
        V: new Sprite([
            [w,w,w,w,n],
            [n,n,n,n,w],
            [w,w,w,w,n]
        ]),
        W: new Sprite([
            [w,w,w,w,n],
            [n,n,n,n,w],
            [n,n,n,w,n],
            [n,n,n,n,w],
            [w,w,w,w,n]
        ]),
        X: new Sprite([
            [w,w,n,w,w],
            [n,n,w,n,n],
            [w,w,n,w,w]
        ]),
        Y: new Sprite([
            [w,w,n,n,n],
            [n,n,w,n,w],
            [w,w,w,w,n]
        ]),
        Z: new Sprite([
            [w,n,n,w,w],
            [w,n,w,n,w],
            [w,w,n,n,w]
        ]),



        ' ': new Sprite([
            [n,n,n,n,n],
            [n,n,n,n,n],
            [n,n,n,n,n]
        ])
    };
});
