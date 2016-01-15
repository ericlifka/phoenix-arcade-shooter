DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, boundEntity, position) {
            this.super('constructor', arguments);

            this.entity = boundEntity;
            this.position = position;
        },

        update: function () {

        }
    });
});
