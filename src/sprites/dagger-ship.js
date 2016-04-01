DefineModule('sprites/dagger-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w1 = "#ffffff";
        var w2 = "#cccccc";
        var g1 = "#aaaaaa";
        var g2 = "#888888";
        var g3 = "#666666";
        var g4 = "#222222";
        var nn = null;
        return new Sprite([
            [ nn, nn, w1, nn, nn ],
            [ nn, nn, w1, nn, nn ],
            [ nn, nn, w1, nn, nn ],
            [ nn, w2, w1, w2, nn ],
            [ nn, w2, g4, w2, nn ],
            [ nn, w2, w1, w2, nn ],
            [ nn, g2, g1, g2, nn ],
            [ g2, g2, nn, g2, g2 ],
            [ g3, nn, nn, nn, g3 ]
        ], {
            guns: [ { x: 2, y: 8 } ]
        });
    }
});
