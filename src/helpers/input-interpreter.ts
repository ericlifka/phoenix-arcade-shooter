import { InputState, Position } from '../types/game';

interface RawInputSource {
    INPUT_TYPE: 'keyboard' | 'gamepad';
    [key: string]: any;
}

function newInputDescriptor(): InputState {
    return {
        movementVector: { x: 0, y: 0 },
        fire: false,
        bomb: false,
        start: false
    };
}

function normalizeVector(vector: Position): void {
    const x = vector.x;
    const y = vector.y;
    const length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    if (length > 1) {
        vector.x = x / length;
        vector.y = y / length;
    }
}

/**
 * Interprets raw input from multiple sources (keyboard, gamepad) and combines them
 * into a single normalized game input state
 */
export default class InputInterpreter {
    interpret(inputSources: RawInputSource[]): InputState {
        const gameInput = newInputDescriptor();

        inputSources.forEach((inputSource) => {
            switch (inputSource.INPUT_TYPE) {
                case 'gamepad':
                    return this.addGamepadInput(inputSource, gameInput);
                case 'keyboard':
                    return this.addKeyboardInput(inputSource, gameInput);
                default:
                    console.error("Unsupported input type: ", inputSource.INPUT_TYPE);
            }
        });

        normalizeVector(gameInput.movementVector);

        return gameInput;
    }

    addKeyboardInput(keyboard: RawInputSource, gameInput: InputState): void {
        if (keyboard['ENTER']) {
            gameInput.start = true;
        }

        if (keyboard['SPACE']) {
            gameInput.fire = true;
        }

        if (keyboard['B']) {
            gameInput.bomb = true;
        }

        if (keyboard['W']) {
            gameInput.movementVector.y -= 1;
        }

        if (keyboard['A']) {
            gameInput.movementVector.x -= 1;
        }

        if (keyboard['S']) {
            gameInput.movementVector.y += 1;
        }

        if (keyboard['D']) {
            gameInput.movementVector.x += 1;
        }
    }

    addGamepadInput(gamepad: RawInputSource, gameInput: InputState): void {
        if (gamepad['start']) {
            gameInput.start = true;
        }

        if (gamepad['A']) {
            gameInput.fire = true;
        }

        if (gamepad['B']) {
            gameInput.bomb = true;
        }

        gameInput.movementVector.x += gamepad['left-stick-x'];
        gameInput.movementVector.y += gamepad['left-stick-y'];

        if (gamepad['d-pad-up']) {
            gameInput.movementVector.y -= 1;
        }
        if (gamepad['d-pad-left']) {
            gameInput.movementVector.x -= 1;
        }
        if (gamepad['d-pad-down']) {
            gameInput.movementVector.y += 1;
        }
        if (gamepad['d-pad-right']) {
            gameInput.movementVector.x += 1;
        }
    }
}
