DefineModule('scripts/watch-for-death', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, entity, callback) {
            this.super('constructor', arguments);

            this.entity = entity;
            this.callback = callback;
            this.started = false;
        },

        update: function () {
            if (this.entity.destroyed && this.started) {
                this.started = false;
                this.callback();
                this.destroy();
            }
        },

        start: function () {
            this.started = true;
        }
    });
});
