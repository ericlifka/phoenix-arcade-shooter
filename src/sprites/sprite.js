window.newSprite = (function () {

    function Sprite(pixels) {
        this.width = pixels.length;
        this.height = pixels[ 0 ].length;

        this.cells = [];
        for (var x = 0; x < this.width; x++) {
            this.cells[ x ] = [];
            for (var y = 0; y < this.height; y++) {
                this.cells[ x ][ y ] = {
                    x: x,
                    y: y,
                    color: pixels[ x ][ y ]
                };
            }
        }
    }

    Sprite.prototype = new CellGrid();
    Sprite.prototype.renderToFrame = function (x, y, frame) {
        frame.cellAt(x, y).color = "white";
    };

    return function (spritePixels) {
        return new Sprite(spritePixels);
    }
}());
