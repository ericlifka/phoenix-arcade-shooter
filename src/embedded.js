import CanvasRenderer from '../libs/pxlr-gl/gl/canvas.js';
import GamepadController from './controllers/gamepad-input.js';
import KeyboardController from './controllers/keyboard-input.js';
import Phoenix from './models/phoenix.js';
import RunLoop from './helpers/run-loop.js';

window.createPhoenixGameInstance = function (targetDiv, gameOverCallback) {
    const gameDimensions = {
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

    runLoop.addCallback(function (dtime) {
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

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            phoenix.pause();
        }
    });

    window.addEventListener("blur", function () {
        phoenix.pause();
    });

    window.addEventListener("focus", function () {
        keyboardInput.clearState();
        gamepadInput.clearState();
    });

    runLoop.start();
    return phoenix;
};
