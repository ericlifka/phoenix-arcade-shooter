DefineModule('main', function (require) {
    var CanvasRenderer = require('views/canvas-renderer');
    var RunLoop = require('helpers/run-loop');
    var KeyboardInputController = require('controllers/keyboard-input');
    var GameController = require('controllers/game');
    var Phoenix = require('phoenix/game');

    var gameDimensions = { width: 200, height: 150 };

    window.activeGame = new GameController({
        renderer: new CanvasRenderer(gameDimensions),
        input: new KeyboardInputController(),
        runLoop: new RunLoop(),
        model: new Phoenix(gameDimensions)
    });
});
