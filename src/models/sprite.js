DefineModule('models/sprite', function (require) {
    return DefineClass(CellGrid, {
        constructor: function Sprite(pixels) {
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
        },
        renderToFrame: function (x, y, frame) {
            this.iterateCells(function (cell, _x, _y) {
                if (cell.color) {
                    frame.cellAt(x + _x, y + _y).color = cell.color;
                }
            });
        },
        rotateLeft: function () {
            var width = this.width;
            var height = this.height;
            var oldCells = this.cells;
            var newCells = [];
            var x, y;

            for (x = 0; x < height; x++) {
                newCells[ x ] = [];
            }

            for (x = 0; x < width; x++) {
                for (y = 0; y < height; y++) {
                    newCells[ y ][ width - x - 1 ] = {
                        x: y,
                        y: width - x - 1,
                        color: oldCells[ x ][ y ].color
                    };
                }
            }

            this.width = height;
            this.height = width;
            this.cells = newCells;
            return this;
        },
        rotateRight: function () {
            return this
                .rotateLeft()
                .rotateLeft()
                .rotateLeft();
        },
        invertX: function () {
            for (var x = 0; x < this.width / 2; x++) {
                var left = this.cells[ x ];
                var right = this.cells[ this.width - x - 1 ];
                this.cells[ x ] = right;
                this.cells[ this.width - x - 1 ] = left;
            }
            return this;
        },
        invertY: function () {
            for (var x = 0; x < this.width; x++) {
                this.cells[x].reverse();
            }
            return this;
        }
    });
});
