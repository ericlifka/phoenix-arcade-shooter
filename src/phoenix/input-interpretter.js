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
                switch(inputSource.INPUT_TYPE) {
                    case 'gamepad': return this.addGamepadInput(inputSource, gameInput);
                    case 'keyboard': return this.addKeyboardInput(inputSource, gameInput);
                    default:
                        console.error("Unsupported input type: ", inputSource.INPUT_TYPE);
                }
            }.bind(this));

            return null;
        }
    });
});
