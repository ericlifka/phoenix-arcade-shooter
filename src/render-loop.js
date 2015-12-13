window.startRenderLoop = (function () {

    function now() {
        return (new Date()).valueOf();
    };

    return function (frameHook) {
        var active = false;
        var lastFrameTime = now();
        var renderContext = { start: start, stop: stop };

        function animationFrameHandler() {
            console.log(browserTime);
            if (!active) { return; }

            var currentTime = now();
            var dtime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            frameHook(dtime);
            window.requestAnimationFrame(animationFrameHandler);
        }
        function start() {
            if (!active) {
                active = true;
                window.requestAnimationFrame(animationFrameHandler);
            }
            return renderContext;
        }
        function stop() {
            active = false;
            return renderContext;
        }

        return renderContext.start();
    };
}());
