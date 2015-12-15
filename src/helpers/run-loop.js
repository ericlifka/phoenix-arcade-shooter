window.newRunLoop = (function () {

    function now() {
        return (new Date()).valueOf();
    }

    return function (runLoopCallback) {
        runLoopCallback = runLoopCallback || function () {};
        var active = false;
        var lastFrameTime = now();
        var renderContext = { start: start, stop: stop, addCallback: addCallback };

        function animationFrameHandler() {
            if (!active) {
                return;
            }

            var currentTime = now();
            var dtime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            console.log('frame', dtime);
            runLoopCallback(dtime);
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

        function addCallback(hook) {
            runLoopCallback = hook;
        }

        return renderContext;
    };
}());
