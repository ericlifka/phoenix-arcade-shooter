DefineModule('models/frame', function (require) {
    return DefineClass(CellGrid, {
        constructor: function Frame(dimensions) {
            this.width = dimensions.width;
            this.height = dimensions.height;
            this.cells = [];

            for (var x = 0; x < this.width; x++) {
                this.cells[ x ] = [];

                for (var y = 0; y < this.height; y++) {
                    this.cells[ x ][ y ] = {
                        x: x,
                        y: y,
                        render_x: x * dimensions.pixelSize,
                        render_y: y * dimensions.pixelSize,
                        color: "#000000"
                    };
                }
            }
        },
        clear: function (color) {
            this.iterateCells(function (cell) {
                cell.color = color;
            });
        }
    });
});
