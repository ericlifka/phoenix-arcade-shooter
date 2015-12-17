window.CellGrid = DefineClass({
    iterateCells: function (handler) {
        for (var x = 0; x < this.width; x++) {
            var column = this.cells[ x ];

            for (var y = 0; y < this.height; y++) {
                handler(column[ y ], x, y);
            }
        }
    },
    cellAt: function (x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.cells[ x ][ y ];
        }
        else {
            return { x: -1, y: -1, color: "#000000" };
        }
    }
});
