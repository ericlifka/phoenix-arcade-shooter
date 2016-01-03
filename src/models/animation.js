DefineModule('models/animation', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (frames) {
            this.frames = frames;
            this.currentFrame = 0;

            this.width = frames[ 0 ].length;
            this.height = frames[ 0 ].length;
        },
        renderToFrame: function (x, y, frame) {

        }
    });
});
