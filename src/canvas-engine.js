window.newCanvasEngine = (function () {

    return function () {
        var el = createCanvasEl();
        var engine = createEngine();

        return engine;
    };
}());
