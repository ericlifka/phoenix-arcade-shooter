window.newGameController = (function () {

    function Game(renderer, renderLoop, input) {
        this.renderer = renderer;
        this.runLoop = renderLoop;
        this.input = input;

        this.runLoop.addCallback(this.renderFrame.bind(this));
        this.runLoop.start();
    }
    Game.prototype = {
        renderFrame: function (dtime) {
            var inputState = this.input.getInputState();
            var frame = this.renderer.newRenderFrame();
            frame.clear("black");

            this.processInput(inputState);

            var x = Math.floor(Math.random() * (frame.width));
            var y = Math.floor(Math.random() * (frame.height));
            frame.cells[x][y].color = "blue";

            this.renderer.renderFrame(frame);
        },
        processInput: function (inputState) {

        }
    };

    return function (injections) {
        return new Game(injections.renderer, injections.runLoop, injections.input);
    };
}());
