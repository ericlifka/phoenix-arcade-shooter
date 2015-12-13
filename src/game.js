window.newGame = (function () {

    return function () {
        var renderer = window.newCanvasEngine();
        var game = createGame({
            renderer: renderer
        });

        return game;
    };
}());
