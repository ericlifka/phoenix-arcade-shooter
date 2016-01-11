DefineModule('fonts/arcade', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 7,
            height: 7,
            credit: "http://www.urbanfonts.com/fonts/Arcade.htm"
        },
        A: new Sprite([
            [n,n,w,w,w,w,w],
            [n,w,w,w,w,w,w],
            [w,w,n,n,w,n,n],
            [w,n,n,n,w,n,n],
            [w,w,n,n,w,n,n],
            [n,w,w,w,w,w,w],
            [n,n,w,w,w,w,w]
        ]),
        B: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,w,w,w,w,w,w],
            [n,w,w,n,w,w,n]
        ]),
        C: new Sprite([
            [n,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,w,n,n,n,w,w],
            [n,w,n,n,n,w,n]
        ]),
        D: new Sprite([
            [w,w,w,w,w,w,w],
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
            [w,n,n,n,n,n,w],
        ]),
        F: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,n,n,n,n],
        ]),
        G: new Sprite([
            [n,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,n,n,w,n,n,w],
            [w,w,n,w,w,w,w],
            [n,w,n,w,w,w,n]
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
        I: new Sprite([
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [n,n,n,n,n,n,n]
        ]),
        J: new Sprite([
            [w,n,n,n,n,n,n],
            [w,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [n,n,n,n,n,w,w],
            [n,n,n,n,n,w,n]
        ]),
        K: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        L: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        M: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        N: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        O: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        P: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        Q: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        R: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        S: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        T: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        U: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        V: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        W: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        X: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        Y: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        Z: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        a: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        b: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        c: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        d: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        e: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        f: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        g: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        h: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        i: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        j: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        k: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        l: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        m: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        n: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        o: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        p: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        q: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        r: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        s: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        t: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        u: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        v: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        w: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        x: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        y: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        z: new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        ' ': new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ])
    };
});
