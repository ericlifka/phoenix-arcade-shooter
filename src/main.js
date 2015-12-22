DefineModule('main', function (require) {
    var newCanvasRenderer = require('views/canvas-renderer');
    var newRunLoop = require('helpers/run-loop');
    var newKeyboardInputController = require('helpers/keyboard-input');
    var GameController = require('controllers/game');
    var newPhoenixGame = require('phoenix/game');
    var gameDimensions = { width: 100, height: 75 };

    window.activeGame = new GameController({
        renderer: newCanvasRenderer(gameDimensions),
        input: newKeyboardInputController(),
        runLoop: newRunLoop(),
        model: newPhoenixGame(gameDimensions)
    });
});
