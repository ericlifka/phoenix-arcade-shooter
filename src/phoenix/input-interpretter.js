DefineModule('phoenix/input-interpretter', function (require) {
    return DefineClass({
        interpret: function (inputSources) {

            inputSources.forEach(function (inputSource) {
                switch(inputSource.INPUT_TYPE) {
                    case 'gamepad': return this.addGamepadInput(inputSource);
                    case 'keyboard': return this.addKeyboardInput(inputSource);
                    default:
                        console.error("Unsupported input type: ", inputSource.INPUT_TYPE);
                }
            }.bind(this));

            return null;
        }
    });
});
