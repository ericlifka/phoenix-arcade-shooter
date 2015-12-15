window.addEventListener('load', function () {
    var gameView = newCanvasRenderer();
    var runLoop = newRunLoop();
    var inputController = newKeyboardInputController();
    var gameModel = newPhoenixModel();

    window.activeGame = newGameController({
        renderer: gameView,
        input: inputController,
        runLoop: runLoop,
        model: gameModel
    });
});
