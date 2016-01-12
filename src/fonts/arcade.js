DefineModule('fonts/arcade', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 7,
            height: 7,
            lineHeight: 11,
            letterSpacing: 1,
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
            [w,n,n,n,n,n,w]
        ]),
        F: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,n,n,n,n]
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
            [w,n,n,n,n,n,w]
        ]),
        J: new Sprite([
            [n,n,n,n,n,w,n],
            [n,n,n,n,n,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,n],
            [w,n,n,n,n,n,n]
        ]),
        K: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,n,w,w,n,n],
            [n,n,w,w,w,w,n],
            [n,w,w,n,w,w,n],
            [w,w,n,n,n,w,w],
            [w,n,n,n,n,n,w]
        ]),
        L: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w]
        ]),
        M: new Sprite([
            [w,w,w,w,w,w,w],
            [n,w,w,w,w,w,w],
            [n,n,w,w,n,n,n],
            [n,n,n,w,w,n,n],
            [n,n,w,w,n,n,n],
            [n,w,w,w,w,w,w],
            [w,w,w,w,w,w,w]
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
        O: new Sprite([
            [n,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [n,w,w,w,w,w,n]
        ]),
        P: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,n,n,w,n,n,n],
            [w,w,w,w,n,n,n],
            [n,w,w,n,n,n,n]
        ]),
        Q: new Sprite([
            [n,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,w,n,w],
            [w,n,n,n,w,w,n],
            [w,w,w,w,w,w,w],
            [n,w,w,w,w,n,w]
        ]),
        R: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,n],
            [w,n,n,w,w,n,n],
            [w,n,n,w,w,w,n],
            [w,w,w,w,n,w,w],
            [n,w,w,n,n,n,w]
        ]),
        S: new Sprite([
            [n,w,w,n,n,w,n],
            [w,w,w,w,n,w,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,w,n,w,w,w,w],
            [n,w,n,n,w,w,n]
        ]),
        T: new Sprite([
            [w,n,n,n,n,n,n],
            [w,n,n,n,n,n,n],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,n],
            [w,n,n,n,n,n,n]
        ]),
        U: new Sprite([
            [w,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,n]
        ]),
        V: new Sprite([
            [w,w,w,w,w,n,n],
            [w,w,w,w,w,w,n],
            [n,n,n,n,n,w,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,w,w],
            [w,w,w,w,w,w,n],
            [w,w,w,w,w,n,n]
        ]),
        W: new Sprite([
            [w,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [n,n,n,n,n,w,w],
            [n,n,n,n,w,w,n],
            [n,n,n,n,n,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,n]
        ]),
        X: new Sprite([
            [w,n,n,n,n,w,w],
            [w,w,n,n,w,w,n],
            [n,w,w,w,w,n,n],
            [n,n,w,w,n,n,n],
            [n,w,w,w,w,n,n],
            [w,w,n,n,w,w,n],
            [w,n,n,n,n,w,w]
        ]),
        Y: new Sprite([
            [w,w,w,n,n,n,n],
            [w,w,w,w,n,n,n],
            [n,n,n,w,w,w,w],
            [n,n,n,w,w,w,w],
            [w,w,w,w,n,n,n],
            [w,w,w,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        Z: new Sprite([
            [w,n,n,n,n,w,w],
            [w,n,n,n,w,w,w],
            [w,n,n,w,w,n,w],
            [w,n,w,w,n,n,w],
            [w,w,w,n,n,n,w],
            [w,w,n,n,n,n,w],
            [w,n,n,n,n,n,w]
        ]),
        a: new Sprite([
            [n,n,n,n,n,w,n],
            [n,n,w,n,w,w,w],
            [n,n,w,n,w,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,w,w,w,w],
            [n,n,n,w,w,w,w]
        ]),
        b: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [n,n,w,w,w,w,w],
            [n,n,n,w,w,w,n]
        ]),
        c: new Sprite([
            [n,n,n,w,w,w,n],
            [n,n,w,w,w,w,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [n,n,w,w,n,w,w],
            [n,n,n,w,n,w,n]
        ]),
        d: new Sprite([
            [n,n,n,w,w,w,n],
            [n,n,w,w,w,w,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w]
        ]),
        e: new Sprite([
            [n,n,n,w,w,w,n],
            [n,n,w,w,w,w,w],
            [n,n,w,n,w,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,w,w,n,w],
            [n,n,n,w,w,n,n]
        ]),
        f: new Sprite([
            [n,n,w,n,n,n,n],
            [n,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,n,w,n,n,n,n],
            [w,n,n,n,n,n,n]
        ]),
        g: new Sprite([
            [n,n,n,w,w,w,n,n,n],
            [n,n,w,w,w,w,w,n,w],
            [n,n,w,n,n,n,w,n,w],
            [n,n,w,n,n,n,w,n,w],
            [n,n,w,n,n,n,w,n,w],
            [n,n,w,w,w,w,w,w,w],
            [n,n,n,w,w,w,w,w,n]
        ]),
        h: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,w,n,n,n,n],
            [n,n,w,n,n,n,n],
            [n,n,w,n,n,n,n],
            [n,n,w,w,w,w,w],
            [n,n,n,w,w,w,w]
        ]),
        i: new Sprite([
            [w,n,w,w,w,w,w],
            [w,n,w,w,w,w,w]
        ]),
        j: new Sprite([
            [n,n,n,n,n,n,w],
            [n,n,w,n,n,n,w],
            [w,n,w,w,w,w,w],
            [w,n,w,w,w,w,n]
        ]),
        k: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,n,n,w,n,n],
            [n,n,n,w,w,w,n],
            [n,n,w,w,n,w,w],
            [n,n,w,n,n,n,w]
        ]),
        l: new Sprite([
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w]
        ]),
        m: new Sprite([
            [n,n,w,w,w,w,w],
            [n,n,w,w,w,w,w],
            [n,n,w,n,n,n,n],
            [n,n,n,w,w,w,w],
            [n,n,w,n,n,n,n],
            [n,n,w,w,w,w,w],
            [n,n,n,w,w,w,w]
        ]),
        n: new Sprite([
            [n,n,w,w,w,w,w],
            [n,n,w,w,w,w,w],
            [n,n,w,n,n,n,n],
            [n,n,w,n,n,n,n],
            [n,n,w,w,w,w,w],
            [n,n,n,w,w,w,w]
        ]),
        o: new Sprite([
            [n,n,n,w,w,w,n],
            [n,n,w,w,w,w,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,n,w],
            [n,n,w,w,w,w,w],
            [n,n,n,w,w,w,n]
        ]),
        p: new Sprite([
            [n,n,w,w,w,w,w,w,w],
            [n,n,w,w,w,w,w,w,w],
            [n,n,w,n,n,n,w,n,n],
            [n,n,w,n,n,n,w,n,n],
            [n,n,w,n,n,n,w,n,n],
            [n,n,w,w,w,w,w,n,n],
            [n,n,n,w,w,w,n,n,n]
        ]),
        q: new Sprite([
            [n,n,n,w,w,w,n,n,n],
            [n,n,w,w,w,w,w,n,n],
            [n,n,w,n,n,n,w,n,n],
            [n,n,w,n,n,n,w,n,n],
            [n,n,w,n,n,n,w,n,n],
            [n,n,w,w,w,w,w,w,w],
            [n,n,w,w,w,w,w,w,w]
        ]),
        r: new Sprite([
            [n,n,w,w,w,w,w],
            [n,n,w,w,w,w,w],
            [n,n,n,w,n,n,n],
            [n,n,w,n,n,n,n],
            [n,n,w,n,n,n,n]
        ]),
        s: new Sprite([
            [n,n,n,w,n,n,n],
            [n,n,w,w,w,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,n,w,n,w],
            [n,n,w,n,w,w,w],
            [n,n,n,n,n,w,n]
        ]),
        t: new Sprite([
            [n,n,w,n,n,n,n],
            [w,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [n,n,w,n,n,n,w],
            [n,n,n,n,n,n,w]
        ]),
        u: new Sprite([
            [n,n,w,w,w,w,w],
            [n,n,w,w,w,w,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w],
            [n,n,w,w,w,w,w],
            [n,n,w,w,w,w,n]
        ]),
        v: new Sprite([
            [n,n,w,w,w,n,n],
            [n,n,w,w,w,w,n],
            [n,n,n,n,n,w,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,w,w],
            [n,n,w,w,w,w,n],
            [n,n,w,w,w,n,n]
        ]),
        w: new Sprite([
            [n,n,w,w,w,w,n],
            [n,n,w,w,w,w,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,w,n],
            [n,n,n,n,n,n,w],
            [n,n,w,w,w,w,w],
            [n,n,w,w,w,w,n]
        ]),
        x: new Sprite([
            [n,n,w,n,n,n,w],
            [n,n,w,w,n,w,w],
            [n,n,n,w,w,w,n],
            [n,n,n,n,w,n,n],
            [n,n,n,w,w,w,n],
            [n,n,w,w,n,w,w],
            [n,n,w,n,n,n,w]
        ]),
        y: new Sprite([
            [n,n,w,w,w,w,n,n,n],
            [n,n,w,w,w,w,w,n,w],
            [n,n,n,n,n,n,w,n,w],
            [n,n,n,n,n,n,w,n,w],
            [n,n,n,n,n,n,w,n,w],
            [n,n,w,w,w,w,w,w,w],
            [n,n,w,w,w,w,w,w,n]
        ]),
        z: new Sprite([
            [n,n,w,n,n,n,w],
            [n,n,w,n,n,w,w],
            [n,n,w,n,w,w,w],
            [n,n,w,n,w,n,w],
            [n,n,w,w,w,n,w],
            [n,n,w,w,n,n,w],
            [n,n,w,n,n,n,w]
        ]),
        ' ': new Sprite([
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        '0': new Sprite([
            [n,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [n,w,w,w,w,w,n]
        ]),
        '1': new Sprite([
            [n,n,n,n,n,n,w],
            [n,w,n,n,n,n,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,n,n,n,n,w],
            [n,n,n,n,n,n,w]
        ]),
        '2': new Sprite([
            [n,w,n,n,n,w,w],
            [w,w,n,n,w,w,w],
            [w,n,n,w,w,n,w],
            [w,n,n,w,n,n,w],
            [w,n,w,w,n,n,w],
            [w,w,w,n,n,n,w],
            [n,w,n,n,n,n,w]
        ]),
        '3': new Sprite([
            [n,w,n,n,n,w,n],
            [w,w,n,n,n,w,w],
            [w,n,n,n,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,w,w,w,w,w,w],
            [n,w,w,n,w,w,n]
        ]),
        '4': new Sprite([
            [n,n,n,w,w,n,n],
            [n,n,w,w,w,n,n],
            [n,w,w,n,w,n,n],
            [w,w,n,n,w,n,n],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [n,n,n,n,w,n,n]
        ]),
        '5': new Sprite([
            [w,w,w,n,n,w,n],
            [w,w,w,n,n,w,w],
            [w,n,w,n,n,n,w],
            [w,n,w,n,n,n,w],
            [w,n,w,n,n,n,w],
            [w,n,w,w,w,w,w],
            [n,n,n,w,w,w,n]

        ]),
        '6': new Sprite([
            [n,w,w,w,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,w,n,w,w,w,w],
            [n,w,n,n,w,w,n]
        ]),
        '7': new Sprite([
            [w,n,n,n,n,n,n],
            [w,n,n,n,n,n,n],
            [w,n,n,w,w,w,w],
            [w,n,w,w,w,w,w],
            [w,w,w,n,n,n,n],
            [w,w,n,n,n,n,n],
            [w,n,n,n,n,n,n]
        ]),
        '8': new Sprite([
            [n,w,w,n,w,w,n],
            [w,w,w,w,w,w,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,w,w,w,w,w,w],
            [n,w,w,n,w,w,n]
        ]),
        '9': new Sprite([
            [n,w,w,n,n,n,n],
            [w,w,w,w,n,n,n],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,n,w],
            [w,n,n,w,n,w,w],
            [w,w,w,w,w,w,n],
            [n,w,w,w,w,n,n]
        ]),
        '!':  new Sprite([
            [n,n,n,n,n,n,w],
            [n,n,n,n,w,n,w],
            [n,n,n,w,w,n,n],
            [n,n,w,w,n,n,n],
            [n,w,w,w,n,n,n],
            [w,w,w,n,n,n,n],
            [w,w,w,n,n,n,n]
        ]),
        '.':  new Sprite([
            [n,n,n,n,n,w,w],
            [n,n,n,n,n,w,w],
            [n,n,n,n,n,n,n],
            [n,n,n,n,n,n,n]
        ]),
        ',':  new Sprite([
            [n,n,n,n,n,n,n,w],
            [n,n,n,n,n,w,w,w],
            [n,n,n,n,n,w,w,n]
        ]),
        '?':  new Sprite([
            [n,w,n,n,n,n,n],
            [w,w,n,n,n,n,n],
            [w,n,n,w,n,w,w],
            [w,n,w,w,n,w,w],
            [w,w,w,n,n,n,n],
            [n,w,n,n,n,n,n]
        ])
    };
});
