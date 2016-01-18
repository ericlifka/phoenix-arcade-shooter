DefineModule('controllers/keyboard-input', function (require) {
    function cloneObj(obj) {
        var nObj = {};
        Object.keys(obj).forEach(function (key) {
            nObj[ key ] = obj[ key ];
        });
        return nObj;
    }

    function newInputDescriptor() {
        return {
            W: false, A: false, S: false, D: false,
            SPACE: false, ENTER: false
        };
    }

    var KEYS = {
        87: 'W', 65: 'A', 83: 'S', 68: 'D',
        32: 'SPACE', 13: 'ENTER'
    };

    return DefineClass({
        constructor: function () {
            this.clearState();

            document.body.addEventListener('keydown', this.keydown.bind(this));
            document.body.addEventListener('keyup', this.keyup.bind(this));
        },
        getInputState: function () {
            var state = cloneObj(this.inputState);
            this.propagateInputClears();
            return state;
        },
        clearState: function () {
            this.clearAfterNext = newInputDescriptor();
            this.inputState = newInputDescriptor();
            this.inputState.INPUT_TYPE = "keyboard";
        },
        propagateInputClears: function () {
            Object.keys(this.clearAfterNext).forEach(function (key) {
                if (this.clearAfterNext[ key ]) {
                    this.inputState[ key ] = false;
                    this.clearAfterNext[ key ] = false;
                }
            }.bind(this));
        },
        keydown: function (event) {
            this.inputState[ KEYS[ event.keyCode ] ] = true;
            this.clearAfterNext[ KEYS[ event.keyCode ] ] = false;
        },
        keyup: function (event) {
            this.clearAfterNext[ KEYS[ event.keyCode ] ] = true;
        }
    });
});
