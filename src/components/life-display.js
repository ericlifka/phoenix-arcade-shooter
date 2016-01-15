DefineModule('components/life-display', function (require) {
    var GameObject = require('model/game-object');

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
