window.newCanvasRenderer = (function () {

    var PIXEL_SIZE = 5;

    function createCanvasEl(width, height) {
        var el = document.createElement('canvas');
        el.width = width * PIXEL_SIZE;
        el.height = height * PIXEL_SIZE;
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
        var container = options.container || document.body;

        var canvas = createCanvasEl(width, height);
        var renderer = new Renderer(canvas, width, height);

        container.appendChild(canvas);

        return renderer;
    };
}());
