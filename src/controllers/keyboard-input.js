function cloneObj(obj) {
    const nObj = {};
    Object.keys(obj).forEach(function (key) {
        nObj[key] = obj[key];
    });
    return nObj;
}

function newInputDescriptor() {
    return {
        W: false, A: false, S: false, D: false,
        SPACE: false, ENTER: false
    };
}

const KEYS = {
    87: 'W', 65: 'A', 83: 'S', 68: 'D',
    32: 'SPACE', 13: 'ENTER'
};

export default class KeyboardInput {
    constructor() {
        this.clearState();

        document.body.addEventListener('keydown', this.keydown.bind(this));
        document.body.addEventListener('keyup', this.keyup.bind(this));
    }

    getInputState() {
        const state = cloneObj(this.inputState);
        this.propagateInputClears();
        return state;
    }

    clearState() {
        this.clearAfterNext = newInputDescriptor();
        this.inputState = newInputDescriptor();
        this.inputState.INPUT_TYPE = "keyboard";
    }

    propagateInputClears() {
        Object.keys(this.clearAfterNext).forEach(function (key) {
            if (this.clearAfterNext[key]) {
                this.inputState[key] = false;
                this.clearAfterNext[key] = false;
            }
        }.bind(this));
    }

    keydown(event) {
        this.inputState[KEYS[event.keyCode]] = true;
        this.clearAfterNext[KEYS[event.keyCode]] = false;
    }

    keyup(event) {
        this.clearAfterNext[KEYS[event.keyCode]] = true;
    }
}
