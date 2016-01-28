DefineModule('phoenix/sprites/combo-gauge', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "#000";
        var n = null;
        return new Sprite([
            [w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w],
            [w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w],
            [w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w],
            [w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w],
            [w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w,n,n,n,n,w],
            [w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w]
        ]);
    };
});
