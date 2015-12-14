window.startRenderLoop = (function () {

    function now() {
        return (new Date()).valueOf();
    }

    return function (frameHook) {
        frameHook = frameHook || function () { };
        var active = false;
        var lastFrameTime = now();
        var renderContext = { start: start, stop: stop, addFrameHook: addFrameHook };

        function animationFrameHandler() {
            if (!active) { return; }

            var currentTime = now();
            var dtime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            console.log('frame', dtime);
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
        function addFrameHook(hook) {
            frameHook = hook;
        }

        return renderContext;
    };
}());
