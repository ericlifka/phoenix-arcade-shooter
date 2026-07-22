interface KeyboardState {
    INPUT_TYPE: string;
    W: boolean;
    A: boolean;
    S: boolean;
    D: boolean;
    SPACE: boolean;
    B: boolean;
    ENTER: boolean;
}

function cloneObj<T extends Record<string, any>>(obj: T): T {
    const nObj = {} as T;
    Object.keys(obj).forEach((key) => {
        nObj[key as keyof T] = obj[key];
    });
    return nObj;
}

function newInputDescriptor(): Omit<KeyboardState, 'INPUT_TYPE'> {
    return {
        W: false, A: false, S: false, D: false,
        SPACE: false, B: false, ENTER: false
    };
}

const KEYS: Record<number, keyof Omit<KeyboardState, 'INPUT_TYPE'>> = {
    87: 'W', 65: 'A', 83: 'S', 68: 'D',
    32: 'SPACE', 66: 'B', 13: 'ENTER'
};

/**
 * Handles keyboard input for the game
 * Maps WASD keys for movement and SPACE/ENTER for actions
 */
export default class KeyboardInput {
    private inputState: KeyboardState;
    private clearAfterNext: Omit<KeyboardState, 'INPUT_TYPE'>;

    constructor() {
        this.inputState = { INPUT_TYPE: 'keyboard', ...newInputDescriptor() };
        this.clearAfterNext = newInputDescriptor();
        this.clearState();

        document.body.addEventListener('keydown', this.keydown.bind(this));
        document.body.addEventListener('keyup', this.keyup.bind(this));
    }

    getInputState(): KeyboardState {
        const state = cloneObj(this.inputState);
        this.propagateInputClears();
        return state;
    }

    clearState(): void {
        this.clearAfterNext = newInputDescriptor();
        this.inputState = { INPUT_TYPE: 'keyboard', ...newInputDescriptor() };
    }

    private propagateInputClears(): void {
        Object.keys(this.clearAfterNext).forEach((key) => {
            const k = key as keyof Omit<KeyboardState, 'INPUT_TYPE'>;
            if (this.clearAfterNext[k]) {
                this.inputState[k] = false;
                this.clearAfterNext[k] = false;
            }
        });
    }

    private keydown(event: KeyboardEvent): void {
        const key = KEYS[event.keyCode];
        if (key) {
            this.inputState[key] = true;
            this.clearAfterNext[key] = false;
        }
    }

    private keyup(event: KeyboardEvent): void {
        const key = KEYS[event.keyCode];
        if (key) {
            this.clearAfterNext[key] = true;
        }
    }
}
