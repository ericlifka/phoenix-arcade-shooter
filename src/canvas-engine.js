window.newCanvasRenderer = (function () {

    function maximumPixelSize(width, height) {

    }

    function createCanvasEl(width, height, pixelSize) {
        var el = document.createElement('canvas');
        el.width = width * pixelSize;
        el.height = height * pixelSize;
        el.classList.add('pixel-engine-canvas');

        return el;
    }

    function Renderer(canvas, width, height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
    }
    Renderer.prototype = {
        getEmptyFrame: function () {

        },
        renderFrame: function (frame) {

        }
    };

    return function (options) {
        options = options || {};
        var width = options.width || 320;
        var height = options.height || 200;
        var pixelSize = maximumPixelSize(width, height);
        var container = options.container || document.body;

        var canvas = createCanvasEl(width, height, pixelSize);
        var renderer = new Renderer(canvas, width, height);

        container.appendChild(canvas);

        return renderer;
    };
}());
