DefineModule('controllers/gamepad-input', function (require) {

    var BUTTON_MAP = {
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
            var gamepad = navigator.getGamepads()[ 0 ];
            var buttonState = { };

            if (gamepad && gamepad.connected) {
                gamepad.buttons.forEach(function (button, index) {
                    if (button.pressed) {
                        console.log(BUTTON_MAP[ index ], button.value);
                        
                    }
                });
            }
        }
    });
});
