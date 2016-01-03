DefineModule('models/animation', function (require) {
    return DefineClass({
        constructor: function (options) {
            this.frames = options.frames;
            this.millisPerFrame = options.millisPerFrame || 100;
            this.currentFrame = options.offsetIndex || 0;
            this.loop = options.loop;

            this.width = this.frames[ 0 ].length;
            this.height = this.frames[ 0 ].length;

        },
        update: function (dtime) {
            console.log('animation update', dtime);
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
