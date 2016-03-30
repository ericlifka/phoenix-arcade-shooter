DefineModule('sprites/player-ship-wing-guns', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
                [ n, n, n, n, w, n, n, n, n ],
                [ n, n, n, n, w, n, n, n, n ],
                [ n, n, n, w, w, w, n, n, n ],
                [ n, n, n, w, w, w, n, n, n ],
                [ w, n, n, w, w, w, n, n, w ],
                [ w, n, w, w, w, w, w, n, w ],
                [ w, w, w, w, w, w, w, w, w ],
                [ n, n, n, w, w, w, n, n, n ],
                [ n, n, n, n, w, n, n, n, n ]
            ],
            {
                guns: [
                    { x: 4, y: 1 },
                    { x: 0, y: 5 },
                    { x: 8, y: 5 }
                ]
            });
    };
});
