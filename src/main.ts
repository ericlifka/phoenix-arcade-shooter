import WebGLRenderer from './rendering/gl/webgl.js';
import GamepadController from './controllers/gamepad-input.js';
import KeyboardController from './controllers/keyboard-input.js';
import Phoenix from './models/phoenix.js';
import RunLoop from './helpers/run-loop.js';
import { Dimensions } from './types/rendering';

declare global {
    interface Window {
        activeGame?: Phoenix;
    }
}

const gameDimensions: Dimensions = { width: 200, height: 150 };
const gamepadInput = new GamepadController();
const keyboardInput = new KeyboardController();

const phoenix = new Phoenix(gameDimensions);
const renderer = new WebGLRenderer(gameDimensions);
const runLoop = new RunLoop();

renderer.setFillColor(phoenix.FILL_COLOR);

runLoop.addCallback(function (dtime: number) {
    phoenix.processInput([
        keyboardInput.getInputState(),
        gamepadInput.getInputState()
    ]);

    phoenix.update(dtime);

    const frame = renderer.newRenderFrame();
    frame.clear();
    phoenix.renderToFrame(frame);

    renderer.renderFrame(frame);
});

document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        phoenix.pause();
    }
});

window.addEventListener('blur', function () {
    phoenix.pause();
});

window.addEventListener('focus', function () {
    keyboardInput.clearState();
    gamepadInput.clearState();
});

/** Enter fullscreen on gesture only while already landscape; stop after success or deny. */
let landscapeFullscreenSettled = false;

function isLandscape(): boolean {
    return window.matchMedia('(orientation: landscape)').matches;
}

function requestLandscapeFullscreen(): void {
    if (landscapeFullscreenSettled || !isLandscape()) {
        return;
    }

    const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
    };
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
        landscapeFullscreenSettled = true;
        return;
    }

    const root = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => void | Promise<void>;
    };
    const request =
        root.requestFullscreen?.bind(root) ??
        root.webkitRequestFullscreen?.bind(root);

    if (!request) {
        landscapeFullscreenSettled = true;
        return;
    }

    Promise.resolve(request())
        .then(function () {
            landscapeFullscreenSettled = true;
        })
        .catch(function () {
            landscapeFullscreenSettled = true;
        });
}

document.addEventListener('pointerdown', requestLandscapeFullscreen, { passive: true });
document.addEventListener('keydown', requestLandscapeFullscreen);

runLoop.start();
window.activeGame = phoenix;

export { };
