DefineModule('controllers/game', function (require) {
    return DefineClass({
        constructor: function GameController(injections) {
            this.renderer = injections.renderer;
            this.runLoop = injections.runLoop;
            this.inputSources = injections.inputSources;
            this.model = injections.model;

            this.renderer.setFillColor(this.model.FILL_COLOR || "white");
            this.runLoop.addCallback(this.renderFrame.bind(this));
            this.runLoop.start();
        },
        renderFrame: function (dtime) {
            this.model.processInput(this.getInputState());
            this.model.update(dtime);

            var frame = this.renderer.newRenderFrame();
            frame.clear();

            this.model.renderToFrame(frame);
            this.renderer.renderFrame(frame);
        },
        getInputState: function () {

        }
    });
});
