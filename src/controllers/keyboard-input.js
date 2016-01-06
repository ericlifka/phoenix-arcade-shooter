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
            INPUT_TYPE: "keyboard",
            W: false, A: false, S: false, D: false,
            SPACE: false
        };
    }

    var KEYS = {
        87: 'W', 65: 'A', 83: 'S', 68: 'D',
        32: 'SPACE'
    };

    return DefineClass({
        constructor: function () {
            this.inputState = newInputDescriptor();
            this.clearAfterNext = newInputDescriptor();

            document.body.addEventListener('keydown', function (event) {
                this.inputState[ KEYS[ event.keyCode ] ] = true;
                this.clearAfterNext[ KEYS[ event.keyCode ] ] = false;
            }.bind(this));
            document.body.addEventListener('keyup', function (event) {
                this.clearAfterNext[ KEYS[ event.keyCode ] ] = true;
            }.bind(this));
        },
        getInputState: function () {
            var state = cloneObj(this.inputState);
            this.propagateInputClears();
            return state;
        },
        propagateInputClears: function () {
            Object.keys(this.clearAfterNext).forEach(function (key) {
                if (this.clearAfterNext[ key ]) {
                    this.inputState[ key ] = false;
                    this.clearAfterNext[ key ] = false;
                }
            }.bind(this));
        }
    });
});
