DefineModule('models/animation', function (require) {
    return DefineClass({
        constructor: function (frames) {
            this.frames = frames;
            this.currentFrame = 0;

            this.width = frames[ 0 ].length;
            this.height = frames[ 0 ].length;
        },
        renderToFrame: function (x, y, frame) {
            this.frames[ 0 ].renderToFrame(x, y, frame);
        }
    });
});
