window.newGame = (function () {

    function Game(renderer) {
        this.renderer = renderer;
    }
    Game.prototype = {

    };

    return function () {
        var renderer = window.newCanvasRenderer();
        var game = new Game(renderer);

        return game;
    };
}());
