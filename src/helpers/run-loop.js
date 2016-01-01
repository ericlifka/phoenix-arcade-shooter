DefineModule('helpers/run-loop', function (require) {

    function now() {
        return (new Date()).valueOf();
    }

    return DefineClass({
        constructor: function (callback) {
            this.callback = callback || function () {};

            this.active = false;
            this.lastFrameTime = now();
        },
        animationFrameHandler: function () {
            if (!this.active) return;

            var currentTime = now();
            var dtime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;

            try {
                this.callback(dtime);
            } catch (e) {
                console.error('Error running frame: ', e);
            }

            window.requestAnimationFrame(this.animationFrameHandler.bind(this));
        },
        start: function () {
            if (!this.active) {
                this.active = true;
                window.requestAnimationFrame(this.animationFrameHandler.bind(this));
            }
            return this;
        },
        stop: function () {
            this.active = false;
            return this;
        },
        addCallback: function (callback) {
            this.callback = callback;
        }
    });
});
