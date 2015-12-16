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
        this.iterateCells(function (cell, _x, _y) {
            if (cell.color) {
                frame.cellAt(x + _x, y + _y).color = cell.color;
            }
        });
    };
    Sprite.prototype.rotateRight = function () {
        var width = this.width;
        var height = this.height;
        var oldCells = this.cells;
        var newCells = [];

        for (var y = 0; y < height; y++) {
            newCells[ y ] = [];
            for (var x = 0; x < width; x++) {
                newCells[ y ][ x ] = {
                    x: y,
                    y: x,
                    color: oldCells[ x ][ y ].color
                };
            }
        }

        this.width = height;
        this.height = width;
        this.cells = newCells;

        return this;
    };

    return function (spritePixels) {
        return new Sprite(spritePixels);
    }
}());
