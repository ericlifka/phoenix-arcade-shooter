window.newCanvasEngine = (function () {

    return function (options) {
        var width = options.width || 320;
        var height = options.height || 200;
        var container = options.container || document.body;

        var el = createCanvasEl();
        var engine = createEngine();

        return engine;
    };
}());
