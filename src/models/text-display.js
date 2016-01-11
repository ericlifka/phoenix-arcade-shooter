DefineModule('models/text-display', function (require) {
    var ArcadeFont = require('fonts/arcade');
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.super('constructor', arguments);

            this.message = (options.message || "").split('');
            this.position = options.position;
        },

        renderToFrame: function (frame) {
            var position = this.position;

            this.message.forEach(function (char, i) {
                var sprite = ArcadeFont[ char ];

                if (sprite) {
                    var x = position.x + i * (ArcadeFont.meta.width + 1);
                    var y = position.y;

                    sprite.renderToFrame(x, y, frame);
                }
                else {
                    console.error("Tried to print an unsupported letter: ", char);
                }
            });
        }
    });
});
