window.startRenderLoop = (function () {

    return function (frameHook) {
        window.requestAnimationFrame(function animationFrameHandler() {
            frameHook();
            window.requestAnimationFrame(animationFrameHandler);
        });
    };
}());
