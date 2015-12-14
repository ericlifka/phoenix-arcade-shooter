window.Frame = (function () {

    function Cell(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    function Frame(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];

        for (var x = 0; x < width; x++) {
            this.cells[x] = [];

            for (var y = 0; y < height; y++) {
                this.cells[x][y] = new Cell(x, y, "#000000");
            }
        }
    }
    Frame.prototype = {

    };

    return Frame;
}());
