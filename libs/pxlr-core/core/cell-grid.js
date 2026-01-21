export default class CellGrid {
    iterateCells(handler) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                handler(this.cells[x][y], x, y);
            }
        }
    }

    cellAt(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.cells[x][y];
        }
        else {
            return { x: -1, y: -1, color: "#000000", index: -1 };
        }
    }
}
