DefineModule('sprites/dagger-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
            [ n, w, n ],
            [ n, w, n ],
            [ n, w, n ],
            [ w, w, w ],
            [ w, w, w ],
            [ w, w, w ],
            [ w, w, w ],
            [ w, w, w ],
            [ n, w, n ]
        ]);
    }
});
