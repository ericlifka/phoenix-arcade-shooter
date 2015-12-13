window.newCanvasRenderer = (function () {

    function createCanvasEl(width, height) {
        var el = document.createElement('canvas');
        el.width = width;
        el.height = height;
        el.classList.add('pixel-engine-canvas');

        return el;
    }

    function createRenderer(canvas) {
        return {
            canvas: canvas
        };
    }

    return function (options) {
        options = options || {};
        var width = options.width || 320;
        var height = options.height || 200;
        var container = options.container || document.body;

        var canvas = createCanvasEl(width, height);
        var renderer = createRenderer(canvas);

        container.appendChild(canvas);

        return renderer;
    };
}());
