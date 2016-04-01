DefineModule('main', function (require) {
    var CanvasRenderer = require('views/canvas-renderer');
    var GamepadController = require('controllers/gamepad-input');
    var KeyboardController = require('controllers/keyboard-input');
    var Phoenix = require('models/phoenix');
    var RunLoop = require('helpers/run-loop');

    window.createPhoenixGameInstance = function (targetDiv, gameOverCallback) {
        var gameDimensions = {
            width: 200,
            height: 150,
            container: targetDiv,
            embedded: true
        };
        var gamepadInput = new GamepadController();
        var keyboardInput = new KeyboardController();

        var phoenix = new Phoenix(gameDimensions);
        var renderer = new CanvasRenderer(gameDimensions);
        var runLoop = new RunLoop();

        phoenix.gameOverCallback = gameOverCallback;
        renderer.setFillColor(phoenix.FILL_COLOR);

        runLoop.addCallback(function (dtime) {
            phoenix.processInput([
                keyboardInput.getInputState(),
                gamepadInput.getInputState()
            ]);

            phoenix.update(dtime);

            var frame = renderer.newRenderFrame();
            frame.clear();
            phoenix.renderToFrame(frame);

            renderer.renderFrame(frame);
        });

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                phoenix.pause();
            }
        });

        window.addEventListener("blur", function () {
            phoenix.pause();
        });

        window.addEventListener("focus", function () {
            keyboardInput.clearState();
            gamepadInput.clearState();
        });

        runLoop.start();
        return phoenix;
    };
});
