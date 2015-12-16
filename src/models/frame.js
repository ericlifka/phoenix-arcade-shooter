window.newFrameModel = (function () {

    function Frame(width, height, pixelSize) {
        this.width = width;
        this.height = height;
        this.cells = [];

        for (var x = 0; x < this.width; x++) {
            this.cells[ x ] = [];

            for (var y = 0; y < this.height; y++) {
                this.cells[ x ][ y ] = {
                    x: x,
                    y: y,
                    render_x: x * pixelSize,
                    render_y: y * pixelSize,
                    color: "#000000"
                };
            }
        }
    }

    Frame.prototype = new CellGrid();
    Frame.prototype.clear = function (color) {
        this.iterateCells(function (cell) {
            cell.color = color;
        });
    };

    return function (dimensions) {
        return new Frame(
            dimensions.width,
            dimensions.height,
            dimensions.pixelSize);
    };
}());
