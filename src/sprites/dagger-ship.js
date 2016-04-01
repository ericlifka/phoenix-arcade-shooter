DefineModule('sprites/dagger-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
            [ n, n, w, n, n ],
            [ n, n, w, n, n ],
            [ n, n, w, n, n ],
            [ n, w, w, w, n ],
            [ n, w, w, w, n ],
            [ n, w, w, w, n ],
            [ n, w, w, w, n ],
            [ w, w, w, w, w ],
            [ w, n, n, n, w ]
        ], {
            guns: [ { x: 2, y: 8 } ]
        });
    }
});
