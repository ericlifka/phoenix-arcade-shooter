import Sprite from './sprite.js';

export default class Animation {
    finished = false;
    frames: Sprite[];
    millisPerFrame: number;
    currentFrame: number;
    loop?: boolean;
    width: number;
    height: number;
    millisEllapsedOnFrame = 0;

    constructor(options: {
        frames: Sprite[];
        millisPerFrame?: number;
        offsetIndex?: number;
        loop?: boolean;
    }) {
        this.frames = options.frames;
        this.millisPerFrame = options.millisPerFrame || 100;
        this.currentFrame = options.offsetIndex || 0;
        this.loop = options.loop;

        this.width = this.frames[0].width;
        this.height = this.frames[0].height;
    }

    update(dtime: number): void {
        if (this.finished) return;

        this.millisEllapsedOnFrame += dtime;

        if (this.millisEllapsedOnFrame >= this.millisPerFrame) {
            this.millisEllapsedOnFrame -= this.millisPerFrame;
            this.currentFrame += 1;

            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                }
                else {
                    this.finished = true;
                }
            }
        }
    }

    renderToFrame(frame: any, x: number, y: number, index: number): void {
        if (this.finished) return;

        this.frames[this.currentFrame].renderToFrame(frame, x, y, index);
    }
}
