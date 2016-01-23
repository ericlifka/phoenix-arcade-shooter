DefineModule('phoenix/sprites/arrow-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w1 = "#ffffff";
        var w2 = "#cccccc";
        var g1 = "#aaaaaa";
        var g2 = "#888888";
        var g3 = "#666666";
        var nn = null;
        return new Sprite([
                [ g3, nn, nn, nn, nn, nn, g3 ],
                [ g2, g2, nn, nn, nn, g2, g2 ],
                [ nn, g2, g1, nn, g1, g2, nn ],
                [ nn, g1, g1, w1, g1, g1, nn ],
                [ nn, nn, w2, w1, w2, nn, nn ],
                [ nn, nn, w2, w1, w2, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn ]
            ],
            {
                guns: [
                    { x: 3, y: 7 }
                ]
            });
    };
});
