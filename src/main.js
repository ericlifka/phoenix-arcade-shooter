DefineModule('main', function (require) {
    var CanvasRenderer = require('views/canvas-renderer');
    //var GameController = require('controllers/game');
    var GamepadController = require('controllers/gamepad-input');
    var KeyboardController = require('controllers/keyboard-input');
    var Phoenix = require('models/phoenix');
    var RunLoop = require('helpers/run-loop');
    //
    var gameDimensions = { width: 200, height: 150 };
    //
    //window.activeGame = new GameController({
    //    inputSources: [
    //        new KeyboardController(),
    //        new GamepadController()
    //    ],
    //    model: new Phoenix(gameDimensions),
    //    renderer: new CanvasRenderer(gameDimensions),
    //    runLoop: new RunLoop()
    //});



    var runLoop = new RunLoop();
    var phoenix = new Phoenix(gameDimensions);
    var renderer = new CanvasRenderer(gameDimensions);
    var keyboardInput = new KeyboardController();
    var gamepadInput = new GamepadController();

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



    runLoop.start();
});
