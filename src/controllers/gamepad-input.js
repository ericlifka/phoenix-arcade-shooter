DefineModule('controllers/gamepad-input', function (require) {
    return DefineClass({
        constructor: function () {
            window.addEventListener("gamepadconnected", function(e) {
                console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);
            });
            window.addEventListener("gamepaddisconnected", function(e) {
                console.log("Gamepad disconnected from index %d: %s",
                e.gamepad.index, e.gamepad.id);
            });
        },
        getInputState: function () {
            var gamepads = Array.prototype.slice.call(navigator.getGamepads());
            gamepads.forEach(function (gamepad) {
                if (gamepad && gamepad.connected) {

                    gamepad.buttons.forEach(function (button, index) {
                        if (button.pressed || button.value == 1.0) {
                            console.log(index);
                        }
                    });

                }
            });
        }
    })
});
