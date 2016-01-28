DefineModule('phoenix/animations/small-explosion', function (require) {
    var Animation = require('models/animation');
    var Random = require('helpers/random');
    var Sprite = require('models/sprite');

    var n = null;
    var y = "yellow";
    var o = "orange";
    var r = "red";

    function newFrameSet() {
        var frames = [
            new Sprite([
                [ n, n, n, n, n ],
                [ n, n, n, n, n ],
                [ n, n, r, n, n ],
                [ n, n, n, n, n ],
                [ n, n, n, n, n ]
            ]),
            new Sprite([
                [ n, n, n, n, n ],
                [ n, n, r, n, n ],
                [ n, y, y, o, n ],
                [ n, n, o, n, n ],
                [ n, n, n, n, n ]
            ]),
            new Sprite([
                [ y, n, r, n, n ],
                [ n, y, y, y, n ],
                [ o, y, n, y, o ],
                [ n, o, r, n, n ],
                [ n, n, y, y, n ]
            ]),
            new Sprite([
                [ y, n, y, n, n ],
                [ n, n, n, n, y ],
                [ n, n, n, n, y ],
                [ n, y, n, n, n ],
                [ n, n, y, y, n ]
            ]),
            new Sprite([
                [ n, n, n, y, n ],
                [ n, y, n, n, n ],
                [ n, n, n, n, n ],
                [ n, n, n, n, n ],
                [ y, n, n, n, y ]
            ])
        ];

        frames.forEach(function (frame) {
            for (var i = 0, times = Random.integer(0, 3); i < times; i++) {
                frame.rotateLeft();
            }
        });

        return frames;
    }


    return function () {
        return new Animation({
            frames: newFrameSet(),
            millisPerFrame: 50
        });
    }
});
