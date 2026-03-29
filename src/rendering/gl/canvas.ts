import Frame from './frame.js';

function maximumPixelSize(width: number, height: number): number {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    let pixelSize = 1;
    while (true) {
        if (width * pixelSize > maxWidth ||
            height * pixelSize > maxHeight) {

            pixelSize--;
            break;
        }

        pixelSize++;
    }

    if (pixelSize <= 0) {
        pixelSize = 1;
    }

    return pixelSize;
}

function createCanvasEl(dimensions: CanvasRenderer): HTMLCanvasElement {
    dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
    dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

    const el = document.createElement('canvas');
    el.width = dimensions.fullWidth;
    el.height = dimensions.fullHeight;
    el.classList.add('pixel-engine-canvas');

    return el;
}

export default class CanvasRenderer {
    width = 80;
    height = 50;
    pixelSize = 1;
    fullWidth!: number;
    fullHeight!: number;
    nextFrame = 0;
    container!: HTMLElement;
    canvas!: HTMLCanvasElement;
    canvasDrawContext!: CanvasRenderingContext2D;
    frames!: Frame[];

    constructor(options?: { width?: number; height?: number; container?: HTMLElement }) {
        options = options || {};

        this.width = options.width || this.width;
        this.height = options.height || this.height;
        this.pixelSize = maximumPixelSize(this.width, this.height);

        this.container = options.container || document.body;
        this.canvas = createCanvasEl(this);
        this.container.appendChild(this.canvas);

        this.canvasDrawContext = this.canvas.getContext('2d', { alpha: false })!;
        this.frames = [
            new Frame(this),
            new Frame(this)
        ];
    }

    newRenderFrame(): Frame {
        return this.frames[this.nextFrame];
    }

    renderFrame(): void {
        const frame = this.frames[this.nextFrame];
        const pixelSize = this.pixelSize;
        const ctx = this.canvasDrawContext;
        const fillColor = frame.fillColor;

        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);

        frame.iterateCells(function (cell, x, y) {
            if (cell.color !== fillColor) {
                ctx.beginPath();
                ctx.rect(cell.render_x, cell.render_y, pixelSize, pixelSize);
                ctx.fillStyle = cell.color;
                ctx.fill();
                ctx.closePath();
            }
        });

        this.nextFrame = +!this.nextFrame; // switch the frames
    }

    setFillColor(fillColor: string): void {
        this.frames.forEach(function (frame) {
            frame.setFillColor(fillColor);
        });
    }
}
