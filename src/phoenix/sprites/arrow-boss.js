DefineModule('phoenix/sprites/arrow-boss', function (require) {
    var Sprite = require('models/sprite');

    function arrowBossSprite() {
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

    arrowBossSprite.meta = {
        guns: [
            { x: 3, y: 8 },
            { x: 8, y: 10 },
            { x: 13, y: 8 }
        ]
    };

    return arrowBossSprite;
});
