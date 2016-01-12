DefineModule('models/animation', function (require) {
    return DefineClass({
        finished: false,
        constructor: function (options) {
            this.frames = options.frames;
            this.millisPerFrame = options.millisPerFrame || 100;
            this.currentFrame = options.offsetIndex || 0;
            this.loop = options.loop;

            this.width = this.frames[ 0 ].width;
            this.height = this.frames[ 0 ].height;
            this.millisEllapsedOnFrame = 0;
        },
        update: function (dtime) {
            if (this.finished) return;

            this.millisEllapsedOnFrame += dtime;

            if (this.millisEllapsedOnFrame >= this.millisPerFrame) {
                this.millisEllapsedOnFrame -= this.millisPerFrame;
                this.currentFrame += 1;

                if (this.currentFrame >= this.frames.length) {
                    if (this.loop) {
                        this.currentFrame = 0;
                    }
                    else {
                        this.finished = true;
                    }
                }
            }
        },
        renderToFrame: function (frame, x, y, index) {
            if (this.finished) return;

            this.frames[ this.currentFrame ].renderToFrame(frame, x, y, index);
        }
    });
});
