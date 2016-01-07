DefineModule('phoenix/input-interpretter', function (require) {

    function newInputDescriptor() {
        return {
            GAME: 'phoenix',
            movementVector: { x: 0, y: 0 },
            fire: false
        };
    }

    return DefineClass({
        interpret: function (inputSources) {
            var gameInput = newInputDescriptor();

            inputSources.forEach(function (inputSource) {
                switch (inputSource.INPUT_TYPE) {
                    case 'gamepad': return this.addGamepadInput(inputSource, gameInput);
                    case 'keyboard': return this.addKeyboardInput(inputSource, gameInput);
                    default:
                        console.error("Unsupported input type: ", inputSource.INPUT_TYPE);
                }
            }.bind(this));

            return null;
        },

        addKeyboardInput: function (keyboard, gameInput) {
            if (keyboard[ 'SPACE' ]) {
                gameInput.fire = true;
            }

            if (keyboard[ 'W' ]) {
                gameInput.movementVector.y -= 1;
            }

            if (keyboard[ 'A' ]) {
                gameInput.movementVector.x -= 1;
            }

            if (keyboard[ 'S' ]) {
                gameInput.movementVector.y += 1;
            }

            if (keyboard[ 'D' ]) {
                gameInput.movementVector.x += 1;
            }
        },

        addGamepadInput: function (gamepad, gameInput) {
            if (gamepad[ 'A' ]) {
                gameInput.fire = true;
            }

            gameInput.movementVector.x += gamepad.axes[ 'left-stick-x' ];
            gameInput.movementVector.y += gamepad.axes[ 'left-stick-y' ];
        }
    });
});
