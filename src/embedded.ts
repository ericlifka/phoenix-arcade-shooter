import CanvasRenderer from './rendering/gl/canvas.js';
import GamepadController from './controllers/gamepad-input.js';
import KeyboardController from './controllers/keyboard-input.js';
import Phoenix from './models/phoenix.js';
import RunLoop from './helpers/run-loop.js';
import { GameOverResult } from './types/game';
import type { PhoenixOptions } from './models/phoenix.js';

declare global {
    interface Window {
        createPhoenixGameInstance: (
            targetDiv: HTMLElement,
            gameOverCallback?: (result: GameOverResult) => void
        ) => Phoenix;
    }
}

window.createPhoenixGameInstance = function (
    targetDiv: HTMLElement,
    gameOverCallback?: (result: GameOverResult) => void
) {
    const gameDimensions: PhoenixOptions = {
        width: 200,
        height: 150,
        container: targetDiv,
        embedded: true
    };
    const gamepadInput = new GamepadController();
    const keyboardInput = new KeyboardController();

    const phoenix = new Phoenix(gameDimensions);
    const renderer = new CanvasRenderer(gameDimensions);
    const runLoop = new RunLoop();

    phoenix.gameOverCallback = gameOverCallback;
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

    runLoop.start();
    return phoenix;
};

export {};
