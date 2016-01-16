DefineModule('phoenix/sprites/bullet', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        return new Sprite([
            [ "white", "white" ]
        ]);
    }
});
