DefineModule('sprites/combo-gauge', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "#fff";
        var n = null;

        return new Sprite([
            [n,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,n],
            [w,w,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,w,w],
            [w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,w],
            [w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,w],
            [w,w,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,w,w],
            [n,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,n]
        ]);
    };
});
