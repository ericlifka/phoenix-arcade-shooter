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


        ' ': new Sprite([
            [n,n,n,n,n],
            [n,n,n,n,n],
            [n,n,n,n,n]
        ])
    };
});
