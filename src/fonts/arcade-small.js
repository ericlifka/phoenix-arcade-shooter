DefineModule('fonts/arcade-small', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 3,
            height: 5,
            lineHeight: 8,
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
            [w,w,n,w,w]
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
            [w,n,n,w,w],
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
        a: new Sprite([
            [n,n,n,n,w,n],
            [n,w,n,w,n,w],
            [n,w,w,w,w,w]
        ]),
        b: new Sprite([
            [w,w,w,w,w],
            [n,n,w,n,w],
            [n,n,n,w,w]
        ]),
        c: new Sprite([
            [n,w,w,w,w],
            [n,w,n,n,w]
        ]),
        d: new Sprite([
            [n,n,n,w,w],
            [n,n,w,n,w],
            [w,w,w,w,w]
        ]),
        e: new Sprite([
            [n,w,w,w,w,n],
            [n,w,n,w,n,w],
            [n,n,w,w,n,n]
        ]),
        f: new Sprite([
            [w,w,w,w,w],
            [w,n,w,n,n]
        ]),
        g: new Sprite([
            [n,n,w,w,n,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,w,w,w,n]
        ]),
        h: new Sprite([
            [w,w,w,w,w],
            [n,n,w,n,n],
            [n,n,n,w,w]
        ]),
        i: new Sprite([
            [w,n,w,w,w]
        ]),
        j: new Sprite([
            [n,n,n,n,n,w],
            [n,w,n,w,w,w]
        ]),
        k: new Sprite([
            [w,w,w,w,w],
            [n,n,w,n,n],
            [n,w,n,w,w]
        ]),
        l: new Sprite([
            [w,w,w,w,w]
        ]),
        m: new Sprite([
            [n,n,w,w,w],
            [n,n,w,n,n],
            [n,n,n,w,n],
            [n,n,w,n,n],
            [n,n,w,w,w]
        ]),
        n: new Sprite([
            [n,n,w,w,w],
            [n,n,w,n,n],
            [n,n,n,w,w]
        ]),
        o: new Sprite([
            [n,n,w,w,w],
            [n,n,w,n,w],
            [n,n,w,w,w]
        ]),
        p: new Sprite([
            [n,n,w,w,w,w,w],
            [n,n,w,n,w,n,n],
            [n,n,w,w,n,n,n]
        ]),
        q: new Sprite([
            [n,n,w,w,n,n,n],
            [n,n,w,n,w,n,n],
            [n,n,w,w,w,w,w]
        ]),
        r: new Sprite([
            [n,n,w,w,w],
            [n,n,w,n,n]
        ]),
        s: new Sprite([
            [n,w,w,n,w],
            [n,w,n,w,w]
        ]),
        t: new Sprite([
            [n,w,n,n,n],
            [w,w,w,w,w],
            [n,w,n,n,n]
        ]),
        u: new Sprite([
            [n,n,w,w,n],
            [n,n,n,n,w],
            [n,n,w,w,w]
        ]),
        v: new Sprite([
            [n,n,w,w,n],
            [n,n,n,n,w],
            [n,n,w,w,n]
        ]),
        w: new Sprite([
            [n,n,w,w,n],
            [n,n,n,n,w],
            [n,n,n,w,w],
            [n,n,n,n,w],
            [n,n,w,w,n]
        ]),
        x: new Sprite([
            [n,n,w,n,w],
            [n,n,n,w,n],
            [n,n,w,n,w]
        ]),
        y: new Sprite([
            [n,n,w,w,w,n,w],
            [n,n,n,n,w,n,w],
            [n,n,w,w,w,w,n]
        ]),
        z: new Sprite([
            [n,n,w,n,n],
            [n,n,w,w,w],
            [n,n,n,n,w]
        ]),
        '0': new Sprite([
            [w,w,w,w,w],
            [w,n,n,n,w],
            [w,w,w,w,w]
        ]),
        '1': new Sprite([
            [w,n,n,n,w],
            [w,w,w,w,w],
            [n,n,n,n,w]
        ]),
        '2': new Sprite([
            [w,n,w,w,w],
            [w,n,w,n,w],
            [n,w,w,n,w]
        ]),
        '3': new Sprite([
            [w,n,w,n,w],
            [w,n,w,n,w],
            [w,w,w,w,w]
        ]),
        '4': new Sprite([
            [w,w,n,n,n],
            [n,n,w,n,n],
            [w,w,w,w,w]
        ]),
        '5': new Sprite([
            [w,w,w,n,w],
            [w,n,w,n,w],
            [w,n,n,w,w]
        ]),
        '6': new Sprite([
            [w,w,w,w,w],
            [w,n,w,n,w],
            [w,n,n,w,w]
        ]),
        '7': new Sprite([
            [w,n,n,w,w],
            [w,n,w,n,n],
            [w,w,n,n,n]
        ]),
        '8': new Sprite([
            [w,w,n,w,w],
            [w,n,w,n,w],
            [w,w,n,w,w]
        ]),
        '9': new Sprite([
            [w,w,n,n,w],
            [w,n,w,n,w],
            [w,w,w,w,w]
        ]),
        '!': new Sprite([
            [w,w,w,n,w]
        ]),
        '.': new Sprite([
            [n,n,n,n,w]
        ]),
        ',': new Sprite([
            [n,n,n,n,w,w]
        ]),
        '?': new Sprite([
            [w,n,w,w,n,w],
            [n,w,n,n,n,n]
        ]),


        ' ': new Sprite([
            [n,n,n,n,n],
            [n,n,n,n,n],
            [n,n,n,n,n]
        ])
    };
});
