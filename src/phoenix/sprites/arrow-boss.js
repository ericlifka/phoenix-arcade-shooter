DefineModule('phoenix/sprites/arrow-boss', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
            [ w, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, w ],
            [ w, w, n, n, n, n, w, w, w, w, w, n, n, n, n, w, w ],
            [ n, w, w, n, w, w, w, w, w, w, w, w, w, n, w, w, n ],
            [ n, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, n ],
            [ n, n, w, w, w, w, w, w, w, w, w, w, w, w, w, n, n ],
            [ n, n, w, w, w, w, w, w, w, w, w, w, w, w, w, n, n ],
            [ n, n, n, w, n, n, w, w, w, w, w, n, n, w, n, n, n ],
            [ n, n, n, w, n, n, n, w, w, w, n, n, n, w, n, n, n ],
            [ n, n, n, w, n, n, n, n, w, n, n, n, n, w, n, n, n ],
            [ n, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, n ]
        ]);
    }
});
