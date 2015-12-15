window.newGameController = (function () {

    function Game(injections) {
        this.renderer = injections.renderer;
        this.runLoop = injections.runLoop;
        this.input = injections.input;
        this.model = injections.model;

        this.runLoop.addCallback(this.renderFrame.bind(this));
        this.runLoop.start();
    }

    Game.prototype = {
        renderFrame: function (dtime) {
            var inputState = this.input.getInputState();
            var frame = this.renderer.newRenderFrame();
            frame.clear("black");

            this.model.processInput(inputState);
            this.model.update(dtime);
            this.model.renderToFrame(frame);

            this.renderer.renderFrame(frame);
        },
        processInput: function (inputState) {

        }
    };

    return function (injectedInterfaces) {
        return new Game(injectedInterfaces);
    };
}());
