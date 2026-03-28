import CellGrid from '../core/cell-grid.js';

export default class Frame extends CellGrid {
    fillColor?: string;

    constructor(dimensions: { width: number; height: number; pixelSize: number }) {
        super();
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.cells = [];

        for (let x = 0; x < this.width; x++) {
            this.cells[x] = [];

            for (let y = 0; y < this.height; y++) {
                this.cells[x][y] = {
                    x: x,
                    y: y,
                    render_x: x * dimensions.pixelSize,
                    render_y: y * dimensions.pixelSize,
                    color: '#000000',
                    index: -1
                };
            }
        }
    }

    clear(): void {
        const color = this.fillColor;
        if (color) {
            this.iterateCells(function (cell) {
                cell.color = color;
                cell.index = -1;
            });
        }
    }

    setFillColor(fillColor: string): void {
        this.fillColor = fillColor;
    }
}
