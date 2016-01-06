DefineModule('controllers/game', function (require) {
    var GamepadController = require('controllers/gamepad-input');

    return DefineClass({
        constructor: function GameController(injections) {
            this.renderer = injections.renderer;
            this.runLoop = injections.runLoop;
            this.input = injections.input;
            this.gamepad = new GamepadController();
            this.model = injections.model;

            this.fillColor = this.model.FILL_COLOR || "white";
            this.renderer.setFillColor(this.fillColor);

            this.runLoop.addCallback(this.renderFrame.bind(this));
            this.runLoop.start();
        },
        renderFrame: function (dtime) {
            var inputState = this.input.getInputState();
            var frame = this.renderer.newRenderFrame();
            frame.clear(this.fillColor);

            this.model.processInput(inputState);
            this.model.update(dtime);
            this.model.renderToFrame(frame);

            this.renderer.renderFrame(frame);
        }
    });
});
