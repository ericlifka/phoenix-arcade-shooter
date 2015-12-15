window.newGame = (function () {

    function Game(renderer, renderLoop, inputManager) {
        this.renderer = renderer;
        this.renderLoop = renderLoop;
        this.inputManager = inputManager;

        this.renderLoop.addFrameHook(this.frameHook.bind(this));
        this.renderLoop.start();
    }
    Game.prototype = {
        frameHook: function (dtime) {
            var inputState = this.inputManager.getInputState();
            var frame = this.renderer.newRenderFrame();
            frame.clear("black");

            this.processInput(inputState);

            var x = Math.floor(Math.random() * (frame.width));
            var y = Math.floor(Math.random() * (frame.height));
            frame.cells[x][y].color = "blue";

            this.renderer.renderFrame(frame);
        }
    };

    return function () {
        var renderer = window.newCanvasRenderer();
        var renderLoop = window.startRenderLoop();
        var inputManager = window.newKeyboardInputManager();

        return new Game(renderer, renderLoop, inputManager);
    };
}());
