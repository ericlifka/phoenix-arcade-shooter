DefineModule('models/text-display', function (require) {
    var ArcadeFont = require('fonts/arcade');
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.super('constructor', arguments);

            this.message = options.message || "";
        },

        renderToFrame: function (frame) {
            var sprite = ArcadeFont[ this.message[ 0 ] ];

            sprite.renderToFrame(0, 0, frame);
        }
    });
});
