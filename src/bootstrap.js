window.onload = function () {
    var gameView = window.newCanvasRenderer();
    var runLoop = window.newRunLoop();
    var inputController = window.newKeyboardInputController();

    window.game = window.newGameController({
        renderer: gameView,
        input: inputController,
        runLoop: runLoop
    });
};
