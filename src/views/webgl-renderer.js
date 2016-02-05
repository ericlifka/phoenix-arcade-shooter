DefineModule('views/webgl-renderer', function (require) {
    var Frame = require('models/frame');

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
        dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
        dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

        var el = document.createElement('canvas');
        el.width = dimensions.fullWidth;
        el.height = dimensions.fullHeight;
        el.classList.add('pixel-engine-canvas');

        return el;
    }

    return DefineClass({
        width: 80,
        height: 50,
        pixelSize: 1,
        nextFrame: 0,

        constructor: function Renderer(options) {
            options = options || {};

            this.width = options.width || this.width;
            this.height = options.height || this.height;
            this.pixelSize = maximumPixelSize(this.width, this.height);

            this.container = options.container || document.body;
            this.canvas = createCanvasEl(this);
            this.container.appendChild(this.canvas);

            this.canvasDrawContext = this.canvas.getContext("2d", { alpha: false });
            this.frames = [
                new Frame(this),
                new Frame(this)
            ];
        },

        newRenderFrame: function () {
            return this.frames[ this.nextFrame ];
        },
        renderFrame: function () {
            var frame = this.frames[ this.nextFrame ];
            var pixelSize = this.pixelSize;
            var ctx = this.canvasDrawContext;
            var fillColor = frame.fillColor;

            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);

            frame.iterateCells(function (cell, x, y) {
                if (cell.color !== fillColor) {
                    ctx.beginPath();
                    ctx.rect(cell.render_x, cell.render_y, pixelSize, pixelSize);
                    ctx.fillStyle = cell.color;
                    ctx.fill();
                    ctx.closePath();
                }
            });

            this.nextFrame = +!this.nextFrame; // switch the frames
        },
        setFillColor: function (fillColor) {
            this.frames.forEach(function (frame) {
                frame.setFillColor(fillColor);
            });
        }
    });
});