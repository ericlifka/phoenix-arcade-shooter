window.newCanvasRenderer = (function () {

    function maximumPixelSize(width, height) {
        var maxWidth = window.innerWidth;
        var maxHeight = window.innerHeight;
        var pixelSize = 1;
        while (true) {
            if (width * pixelSize > maxWidth ||
                height * pixelSize > maxHeight) {

                pixelSize--;
                break;
            }

            pixelSize++;
        }

        if (pixelSize <= 0) {
            pixelSize = 1;
        }

        return pixelSize;
    }

    function createCanvasEl(dimensions) {
        var width = dimensions.width;
        var height = dimensions.height;
        var pixelSize = dimensions.pixelSize;

        var el = document.createElement('canvas');
        el.width = width * pixelSize;
        el.height = height * pixelSize;
        el.classList.add('pixel-engine-canvas');

        return el;
    }

    function Renderer(canvas, dimensions) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", { alpha: false });
        this.dimensions = dimensions;
        this.frames = [
            new Frame(dimensions.width, dimensions.height),
            new Frame(dimensions.width, dimensions.height)
        ];
        this.nextFrame = 0;
    }
    Renderer.prototype = {
        newRenderFrame: function () {
            return this.frames[this.nextFrame];
        },
        renderFrame: function () {
            var frame = this.frames[this.nextFrame];
            var lastFrame = this.frames[+!this.nextFrame];
            var pixelSize = this.dimensions.pixelSize;
            var ctx = this.ctx;

            frame.iterateCells(function (cell, x, y) {
                if (cell.color !== lastFrame.cells[x][y].color) {
                    ctx.beginPath();
                    ctx.rect(cell.x * pixelSize, cell.y * pixelSize, pixelSize, pixelSize);
                    ctx.fillStyle = cell.color;
                    ctx.fill();
                    ctx.closePath();
                }
            });

            this.nextFrame = +!this.nextFrame; // switch the frames
        }
    };

    return function (options) {
        options = options || {};
        var width = options.width || 80;
        var height = options.height || 50;
        var pixelSize = maximumPixelSize(width, height);
        var container = options.container || document.body;
        var dimensions = { width: width, height: height, pixelSize: pixelSize };

        var canvas = createCanvasEl(dimensions);
        var renderer = new Renderer(canvas, dimensions);

        container.appendChild(canvas);

        return renderer;
    };
}());
