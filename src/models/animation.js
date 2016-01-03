DefineModule('models/animation', function (require) {
    return DefineClass({
        constructor: function (frames) {
            this.frames = frames;
            this.currentFrame = 0;

            this.width = frames[ 0 ].length;
            this.height = frames[ 0 ].length;
        },
        renderToFrame: function (x, y, frame) {
            this.frames[ this.currentFrame ].renderToFrame(x, y, frame);

            this.currentFrame += 1;
            if (this.currentFrame >= this.frames.length) {
                this.currentFrame = 0;
            }
        }
    });
});
