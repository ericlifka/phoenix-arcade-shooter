DefineModule('models/text-display', function (require) {
    var ArcadeFont = require('fonts/arcade');
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.super('constructor', arguments);

            this.message = (options.message || "").split('');
        },

        renderToFrame: function (frame) {
            this.message.forEach(function (char, i) {
                var sprite = ArcadeFont[ char ];

                if (sprite) {
                    sprite.renderToFrame(i * (ArcadeFont.meta.width + 1), 0, frame);
                }
                else {
                    console.error("Tried to print an unsupported letter: ", char);
                }
            });
        }
    });
});
