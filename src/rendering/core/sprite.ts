import CellGrid from './cell-grid.js';

export default class Sprite extends CellGrid {
    finished = true;
    meta: Record<string, unknown>;
    offsetAdjustment: { x: number; y: number };

    constructor(pixels: (string | null)[][], meta?: Record<string, unknown>) {
        super();
        this.meta = meta || {};
        this.width = pixels.length;
        this.height = pixels[0].length;
        this.offsetAdjustment = { x: 0, y: 0 };

        this.cells = [];
        for (let x = 0; x < this.width; x++) {
            this.cells[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.cells[x][y] = {
                    x: x,
                    y: y,
                    color: pixels[x][y]
                };
            }
        }
    }

    setPermanentOffset(offset?: { x?: number; y?: number }): this {
        offset = offset || {};
        this.offsetAdjustment.x = offset.x || 0;
        this.offsetAdjustment.y = offset.y || 0;

        return this;
    }

    applyColor(color: string): this {
        this.iterateCells(function (cell) {
            if (cell.color) {
                cell.color = color;
            }
        });

        return this;
    }

    update(_dtime: number): void {
        /*
         sprites ignore updates by default, but accept the event
         so that the api signature of sprites and animations matches
         */
    }

    renderToFrame(frame: any, x: number, y: number, index: number): void {
        index = index || 0;
        const offset_x = this.offsetAdjustment.x;
        const offset_y = this.offsetAdjustment.y;
        this.iterateCells(function (cell, _x, _y) {
            if (cell.color) {
                const frameCell = frame.cellAt(x + _x + offset_x, y + _y + offset_y);
                if (index >= frameCell.index) {
                    frameCell.color = cell.color;
                    frameCell.index = index;
                }
            }
        });
    }

    clone(): Sprite {
        const colorGrid: (string | null)[][] = [];
        for (let x = 0; x < this.width; x++) {
            colorGrid[x] = [];
            for (let y = 0; y < this.height; y++) {
                colorGrid[x][y] = this.cells[x][y].color;
            }
        }

        const sprite = new Sprite(colorGrid);
        sprite.setPermanentOffset(this.offsetAdjustment);

        return sprite;
    }

    rotateLeft(): this {
        const width = this.width;
        const height = this.height;
        const oldCells = this.cells;
        const newCells: typeof this.cells = [];
        let x: number;
        let y: number;

        for (x = 0; x < height; x++) {
            newCells[x] = [];
        }

        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                newCells[y][width - x - 1] = {
                    x: y,
                    y: width - x - 1,
                    color: oldCells[x][y].color
                };
            }
        }

        this.width = height;
        this.height = width;
        this.cells = newCells;
        return this;
    }

    rotateRight(): this {
        const width = this.width;
        const height = this.height;
        const oldCells = this.cells;
        const newCells: typeof this.cells = [];
        let x: number;
        let y: number;

        for (x = 0; x < height; x++) {
            newCells[x] = [];
        }

        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                newCells[height - y - 1][x] = {
                    x: height - y - 1,
                    y: x,
                    color: oldCells[x][y].color
                };
            }
        }

        this.width = height;
        this.height = width;
        this.cells = newCells;
        return this;
    }

    invertX(): this {
        for (let x = 0; x < this.width / 2; x++) {
            const left = this.cells[x];
            const right = this.cells[this.width - x - 1];
            this.cells[x] = right;
            this.cells[this.width - x - 1] = left;
        }
        return this;
    }

    invertY(): this {
        for (let x = 0; x < this.width; x++) {
            this.cells[x].reverse();
        }
        return this;
    }
}
