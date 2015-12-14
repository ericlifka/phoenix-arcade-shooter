window.Frame = (function () {
    function Frame(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];

        for (var x = 0; x < width; x++) {
            this.cells[x] = [];

            for (var y = 0; y < height; y++) {
                this.cells[x][y] = { x: x, y: y, color: "#000000" };
            }
        }
    }
    Frame.prototype = {

    };

    return Frame;
}());
