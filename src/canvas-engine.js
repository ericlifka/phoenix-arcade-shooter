window.newCanvasEngine = (function () {

    function createCanvasEl(width, height) {
        var el = document.createElement('canvas');
        el.width = width;
        el.height = height;
        el.classList.add('pixel-engine-canvas');

        return el;
    }

    function createEngine(canvas) {
        return {
            canvas: canvas
        };
    }

    return function (options) {
        var width = options.width || 320;
        var height = options.height || 200;
        var container = options.container || document.body;

        var canvas = createCanvasEl(width, height);
        var engine = createEngine(canvas);

        container.appendChild(canvas);

        return engine;
    };
}());
