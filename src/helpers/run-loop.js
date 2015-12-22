DefineModule('helpers/run-loop', function (require) {

    function now() {
        return (new Date()).valueOf();
    }

    return function (runLoopCallback) {
        runLoopCallback = runLoopCallback || function () {};
        var active = false;
        var lastFrameTime = now();
        var runLoopHandle = { start: start, stop: stop, addCallback: addCallback };

        function animationFrameHandler() {
            if (!active) {
                return;
            }

            var currentTime = now();
            var dtime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            console.log('frame', dtime);
            try {
                runLoopCallback(dtime);
            } catch (e) {
                console.error("Error running frame: ", e);
            }
            window.requestAnimationFrame(animationFrameHandler);
        }

        function start() {
            if (!active) {
                active = true;
                window.requestAnimationFrame(animationFrameHandler);
            }
            return runLoopHandle;
        }

        function stop() {
            active = false;
            return runLoopHandle;
        }

        function addCallback(hook) {
            runLoopCallback = hook;
        }

        return runLoopHandle;
    };
});
