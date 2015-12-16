window.addEventListener('load', function () {
    var gameView = newCanvasRenderer({ width: 100, height: 75 });
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
