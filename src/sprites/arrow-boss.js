DefineModule('sprites/arrow-boss', function (require) {
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
                [ g3, nn, nn, nn, nn, nn, nn, nn, g3, nn, nn, nn, nn, nn, nn, nn, g3 ],
                [ g2, g2, nn, nn, nn, nn, g2, g2, w2, g2, g2, nn, nn, nn, nn, g2, g2 ],
                [ nn, g2, g1, nn, g1, g1, w2, w2, w2, w2, w2, g1, g1, nn, g1, g2, nn ],
                [ nn, g1, g1, g1, g1, w2, w2, w2, g3, w2, w2, w2, g1, g1, g1, g1, nn ],
                [ nn, nn, w2, g1, w2, w1, w2, g3, g4, g3, w2, w1, w2, g1, w2, nn, nn ],
                [ nn, nn, w2, w1, w2, w1, w1, w2, g3, w2, w1, w1, w2, w1, w2, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, w1, w1, w2, w1, w1, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn, w1, w1, w1, nn, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn ],
                [ nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn ]
            ],
            {
                guns: [
                    { x: 3, y: 8 },
                    { x: 8, y: 10 },
                    { x: 13, y: 8 }
                ]
            });
    };
});
