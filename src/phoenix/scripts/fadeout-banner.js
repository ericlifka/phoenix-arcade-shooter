DefineModule('phoenix/scripts/auto-fadeout-text', function (require) {
    var GameObject = require('models/game-object');
    return DefineClass(GameObject, {
        constructor: function (parent, text) {
            this.super('constructor', arguments);

            this.text = text;
        }
    });
});
