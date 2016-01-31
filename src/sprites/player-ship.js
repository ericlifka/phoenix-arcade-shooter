DefineModule('sprites/player-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
            [ n, n, n, w, n, n, n ],
            [ n, n, n, w, n, n, n ],
            [ n, n, w, w, w, n, n ],
            [ n, n, w, w, w, n, n ],
            [ w, n, w, w, w, n, w ],
            [ w, n, w, w, w, n, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, w, w, w, n, n ],
            [ n, n, n, w, n, n, n ]
        ],
        {
            guns: [
                { x: 3, y: 1 },
                { x: 0, y: 5 },
                { x: 6, y: 5 }
            ]
        });
    };
});