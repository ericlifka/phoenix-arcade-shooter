DefineModule('controllers/game', function (require) {
    return DefineClass({
        constructor: function GameController(injections) {
            document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
            window.addEventListener("blur", this.handleBlur.bind(this));
            window.addEventListener("focus", this.handleFocus.bind(this));

            this.renderer = injections.renderer;
            this.runLoop = injections.runLoop;
            this.inputSources = injections.inputSources;
            this.model = injections.model;

            this.renderer.setFillColor(this.model.FILL_COLOR || "white");
            this.runLoop.addCallback(this.processGameFrame.bind(this));
            this.runLoop.start();
        },
        processGameFrame: function (dtime) {
            var frame = this.renderer.newRenderFrame();
            frame.clear();

            this.model.processInput(this.getInputState());
            this.model.update(dtime);
            this.model.renderToFrame(frame);

            this.renderer.renderFrame(frame);
        },
        getInputState: function () {
            return this.inputSources.map(function (inputSource) {
                return inputSource.getInputState();
            });
        },
        handleVisibilityChange: function () {
            if (document.hidden) {
                this.model.pause();
            }
        },
        handleBlur: function () {
            this.model.pause();
        },
        handleFocus: function () {
            this.inputSources.forEach(function (input) {
                input.clearState();
            });
        }
    });
});
