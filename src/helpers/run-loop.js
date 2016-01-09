DefineModule('helpers/run-loop', function (require) {

    function updateFPScounter(dtime) {
        var fps = 1000 / dtime;
        console.log(fps);
    }

    function now() {
        return (new Date()).valueOf();
    }

    return DefineClass({
        constructor: function (callback) {
            this.callback = callback || function () {};

            this.active = false;
            this.lastFrameTime = now();
            this.boundFrameHandler = this.frameHandler.bind(this);
        },
        frameHandler: function () {
            if (!this.active) return;

            var currentTime = now();
            var dtime = currentTime - this.lastFrameTime;

            this.lastFrameTime = currentTime;
            updateFPScounter(dtime);

            try {
                this.callback(dtime);
            } catch (e) {
                console.error('Error running frame: ', e);
            }

            window.requestAnimationFrame(this.boundFrameHandler);
        },
        start: function () {
            if (!this.active) {
                this.active = true;
                window.requestAnimationFrame(this.boundFrameHandler);
            }
        },
        stop: function () {
            this.active = false;
        },
        addCallback: function (callback) {
            this.callback = callback;
        }
    });
});
