DefineModule('models/animation', function (require) {
    return DefineClass({
        constructor: function (options) {
            this.frames = options.frames;
            this.millisPerFrame = options.millisPerFrame || 100;
            this.currentFrame = options.offsetIndex || 0;
            this.loop = options.loop;

            this.width = this.frames[ 0 ].length;
            this.height = this.frames[ 0 ].length;
            this.millisEllapsedOnFrame = 0;
        },
        update: function (dtime) {
            this.millisEllapsedOnFrame += dtime;

            if (this.millisEllapsedOnFrame >= this.millisPerFrame) {
                this.millisEllapsedOnFrame -= this.millisPerFrame;

                this.currentFrame += 1;
                if (this.currentFrame >= this.frames.length) {
                    this.currentFrame = 0;
                }
            }
        },
        renderToFrame: function (x, y, frame) {
            this.frames[ this.currentFrame ].renderToFrame(x, y, frame);
        }
    });
});
