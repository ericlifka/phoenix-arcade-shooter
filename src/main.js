DefineModule('main', function (require) {
    var CanvasRenderer = require('views/canvas-renderer');
    var RunLoop = require('helpers/run-loop');
    var KeyboardController = require('controllers/keyboard-input');
    var GamepadController = require('controllers/gamepad-input');
    var GameController = require('controllers/game');
    var Phoenix = require('phoenix/game');

    var gameDimensions = { width: 200, height: 150 };

    window.activeGame = new GameController({
        renderer: new CanvasRenderer(gameDimensions),
        inputSources: [
            new KeyboardController(),
            new GamepadController()
        ],
        runLoop: new RunLoop(),
        model: new Phoenix(gameDimensions)
    });
});
