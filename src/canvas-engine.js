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

            var ctx = this.canvas.getContext("2d", { alpha: false });

            for (var x = 0; x < this.dimensions.width; x++) {
                for (var y = 0; y < this.dimensions.height; y++) {
                    var cell = frame.cells[x][y];
                    var last = lastFrame.cells[x][y];

                    if (cell.color !== last.color) {
                        ctx.fillStyle = cell.color;
                        ctx.fillRect(
                            cell.x * pixelSize,
                            cell.y * pixelSize,
                            pixelSize,
                            pixelSize);
                    }
                }
            }

            this.nextFrame = +!this.nextFrame; // switch the frames
        },
        cellToXOffset: function (cell) {
            return cell.x * this.dimensions.pixelSize;
        },
        cellToYOffset: function (cell) {
            return cell.y * this.dimensions.pixelSize;
        }
    };

    return function (options) {
        options = options || {};
        var width = options.width || 320;
        var height = options.height || 200;
        var pixelSize = maximumPixelSize(width, height);
        var container = options.container || document.body;
        var dimensions = { width: width, height: height, pixelSize: pixelSize };

        var canvas = createCanvasEl(dimensions);
        var renderer = new Renderer(canvas, dimensions);

        container.appendChild(canvas);

        return renderer;
    };
}());
