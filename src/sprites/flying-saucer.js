DefineModule('sprites/flying-saucer', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
                [ n, n, n, w, w, w, w, w, n, n, n ],
                [ n, n, w, n, n, n, n, n, w, n, n ],
                [ n, w, n, n, n, n, n, n, n, w, n ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ w, n, n, n, n, w, n, n, n, n, w ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ n, w, n, n, n, n, n, n, n, w, n ],
                [ n, n, w, n, n, n, n, n, w, n, n ],
                [ n, n, n, w, w, w, w, w, n, n, n ]
            ],
            {
                guns: [
                ]
            });
    };
});
