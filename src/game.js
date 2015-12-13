window.newGame = (function () {

    function startRenderLoopForGame(gameInstance) {
        gameInstance.renderLoop = window.startRenderLoop(function (dTime) {
            gameInstance.frameHook(dTime);
        });
    }

    function Game(renderer) {
        this.renderer = renderer;
    }
    Game.prototype = {
        frameHook: Function (dTime) {

        }
    };

    return function () {
        var renderer = window.newCanvasRenderer();
        var game = new Game(renderer);
        
        startRenderLoopForGame(game);

        return game;
    };
}());
