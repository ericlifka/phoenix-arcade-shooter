interface FPSCounterElement extends HTMLDivElement {
    oldfps: number;
}

interface FPSTracker extends Array<number> {
    totalTime: number;
    push(ftime: number): number;
    average(): number;
}

let fpsCounterDOM: FPSCounterElement | null = null;

function updateFPScounter(dtime: number): void {
    if (!fpsCounterDOM) {
        fpsCounterDOM = document.createElement('div') as FPSCounterElement;
        fpsCounterDOM.classList.add('fps-counter');
        fpsCounterDOM.oldfps = 0;
        document.body.appendChild(fpsCounterDOM);
    }

    let fps = Math.floor(1000 / dtime * 10) / 10;
    if (Math.abs(fps - fpsCounterDOM.oldfps) > .2) {
        fpsCounterDOM.oldfps = fps;
        let fpsStr = fps + "";
        fpsStr += (fpsStr.length <= 2 ? ".0" : "") + " fps";
        fpsCounterDOM.innerHTML = fpsStr;
    }
}

function now(): number {
    return (new Date()).valueOf();
}

function fpsTracker(): FPSTracker {
    const frameTimes: any[] = [];

    for (let i = 0; i < 100; i++) {
        frameTimes.push(20);
    }
    (frameTimes as FPSTracker).totalTime = 20 * 100;

    (frameTimes as FPSTracker).push = function (ftime: number): number {
        const overflow = this.shift();
        this.totalTime += ftime - overflow;
        return Array.prototype.push.call(this, ftime);
    };
    (frameTimes as FPSTracker).average = function (): number {
        return this.totalTime / this.length;
    };

    return frameTimes as FPSTracker;
}

/**
 * Main game loop using requestAnimationFrame
 */
export default class RunLoop {
    private callback: (dtime: number) => void;
    private fpsTracker: FPSTracker;
    private active: boolean;
    private lastFrameTime: number;
    private boundFrameHandler: () => void;

    constructor(callback?: (dtime: number) => void) {
        this.callback = callback || function () { };

        this.fpsTracker = fpsTracker();
        this.active = false;
        this.lastFrameTime = now();
        this.boundFrameHandler = this.frameHandler.bind(this);
    }

    private frameHandler(): void {
        if (!this.active) return;

        const currentTime = now();
        const dtime = currentTime - this.lastFrameTime;

        this.lastFrameTime = currentTime;
        this.updateFPScounter(dtime);

        try {
            this.callback(dtime);
        } catch (e) {
            console.error('Error running frame: ', e);
        }

        window.requestAnimationFrame(this.boundFrameHandler);
    }

    start(): void {
        if (!this.active) {
            this.active = true;
            window.requestAnimationFrame(this.boundFrameHandler);
        }
    }

    stop(): void {
        this.active = false;
    }

    addCallback(callback: (dtime: number) => void): void {
        this.callback = callback;
    }

    private updateFPScounter(dtime: number): void {
        this.fpsTracker.push(dtime);

        updateFPScounter(this.fpsTracker.average());
    }
}
