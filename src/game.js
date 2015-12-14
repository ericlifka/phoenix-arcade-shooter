window.newGame = (function () {

    function Game(renderer, renderLoop) {
        this.renderer = renderer;
        this.renderLoop = renderLoop;

        this.renderLoop.addFrameHook(this.frameHook.bind(this));
        this.renderLoop.start();
    }
    Game.prototype = {
        frameHook: function (dtime) {
            var frame = this.renderer.getEmptyFrame();

            /* do stuff */

            this.renderer.renderFrame(frame);
        }
    };

    return function () {
        var renderer = window.newCanvasRenderer();
        var renderLoop = window.startRenderLoop();
        var game = new Game(renderer, renderLoop);

        return game;
    };
}());
