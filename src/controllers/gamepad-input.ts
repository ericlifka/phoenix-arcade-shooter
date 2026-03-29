interface GamepadState {
    INPUT_TYPE: string;
    A: boolean;
    B: boolean;
    X: boolean;
    Y: boolean;
    'left-bumper': boolean;
    'right-bumper': boolean;
    'left-trigger': boolean;
    'right-trigger': boolean;
    back: boolean;
    start: boolean;
    'left-stick-press': boolean;
    'right-stick-press': boolean;
    'd-pad-up': boolean;
    'd-pad-down': boolean;
    'd-pad-left': boolean;
    'd-pad-right': boolean;
    'left-stick-x': number;
    'left-stick-y': number;
    'right-stick-x': number;
    'right-stick-y': number;
}

type GamepadButton = keyof Omit<GamepadState, 'INPUT_TYPE' | 'left-stick-x' | 'left-stick-y' | 'right-stick-x' | 'right-stick-y'>;

const BUTTON_MAP: Record<number, GamepadButton> = {
    0: 'A',
    1: 'B',
    2: 'X',
    3: 'Y',
    4: 'left-bumper',
    5: 'right-bumper',
    6: 'left-trigger',
    7: 'right-trigger',
    8: 'back',
    9: 'start',
    10: 'left-stick-press',
    11: 'right-stick-press',
    12: 'd-pad-up',
    13: 'd-pad-down',
    14: 'd-pad-left',
    15: 'd-pad-right'
};

function gamepadDescriptor(): GamepadState {
    const descriptor: any = { INPUT_TYPE: 'gamepad' };

    Object.keys(BUTTON_MAP).forEach((key) => {
        descriptor[BUTTON_MAP[parseInt(key)]] = false;
    });

    descriptor['left-stick-x'] = 0;
    descriptor['left-stick-y'] = 0;
    descriptor['right-stick-x'] = 0;
    descriptor['right-stick-y'] = 0;

    return descriptor as GamepadState;
}

function normalize(axisTilt: number): number {
    return Math.round(axisTilt * 10) / 10;
}

/**
 * Handles gamepad/controller input for the game
 * Supports standard gamepads with buttons and analog sticks
 */
export default class GamepadInput {
    constructor() {
        window.addEventListener("gamepadconnected", (e: GamepadEvent) => {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);
        });
        window.addEventListener("gamepaddisconnected", (e: GamepadEvent) => {
            console.log("Gamepad disconnected from index %d: %s",
                e.gamepad.index, e.gamepad.id);
        });
    }

    getInputState(): GamepadState {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[0];
        const gamepadState = gamepadDescriptor();

        if (gamepad && gamepad.connected) {
            gamepad.buttons.forEach((button, index) => {
                const buttonName = BUTTON_MAP[index];
                if (buttonName) {
                    gamepadState[buttonName] = button.pressed;
                }
            });

            gamepadState['left-stick-x'] = normalize(gamepad.axes[0]);
            gamepadState['left-stick-y'] = normalize(gamepad.axes[1]);
            gamepadState['right-stick-x'] = normalize(gamepad.axes[2]);
            gamepadState['right-stick-y'] = normalize(gamepad.axes[3]);
        }

        return gamepadState;
    }

    clearState(): void {
        /* no op for gamepads */
    }
}
