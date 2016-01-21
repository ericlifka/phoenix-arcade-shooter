DefineModule('phoenix/sprites/arrow-ship', function (require) {
    var Sprite = require('models/sprite');

    function arrowShipSprite() {
        var w = "white";
        var n = null;
        return new Sprite([
            [ w, n, n, n, n, n, w ],
            [ w, w, n, n, n, w, w ],
            [ n, w, w, n, w, w, n ],
            [ n, w, w, w, w, w, n ],
            [ n, n, w, w, w, n, n ],
            [ n, n, w, w, w, n, n ],
            [ n, n, n, w, n, n, n ],
            [ n, n, n, w, n, n, n ]
        ]);
    }

    arrowShipSprite.meta = {
        guns: [
            { x: 3, y: 6 }
        ]
    };

    return arrowShipSprite;
});
