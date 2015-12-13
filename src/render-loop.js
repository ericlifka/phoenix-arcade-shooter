window.startRenderLoop = (function () {

    function now() {
        return (new Date()).valueOf();
    };

    return function (frameHook) {
        var current = now();
        window.requestAnimationFrame(function animationFrameHandler() {
            var now = now();
            var dtime = now - current;
            current = now;

            frameHook(dtime);
            window.requestAnimationFrame(animationFrameHandler);
        });
    };
}());
