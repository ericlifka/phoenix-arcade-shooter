DefineModule('phoenix/input-interpreter', function (require) {

    function newInputDescriptor() {
        return {
            GAME: 'phoenix',
            movementVector: { x: 0, y: 0 },
            fire: false
        };
    }

    function normalizeVector(vector) {
        var x = vector.x;
        var y = vector.y;
        var length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

        if (length > 1) {
            vector.x = x / length;
            vector.y = y / length;
        }
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

            normalizeVector(gameInput.movementVector);

            return gameInput;
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

            gameInput.movementVector.x += gamepad[ 'left-stick-x' ];
            gameInput.movementVector.y += gamepad[ 'left-stick-y' ];

            if (gamepad[ 'd-pad-up' ]) {
                gameInput.movementVector.y -= 1;
            }
            if (gamepad[ 'd-pad-left' ]) {
                gameInput.movementVector.x -= 1;
            }
            if (gamepad[ 'd-pad-down' ]) {
                gameInput.movementVector.y += 1;
            }
            if (gamepad[ 'd-pad-right' ]) {
                gameInput.movementVector.x += 1;
            }
        }
    });
});
