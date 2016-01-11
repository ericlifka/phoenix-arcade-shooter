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
            var offset = 0;

            this.message.forEach(function (char) {
                var sprite = ArcadeFont[ char ];

                if (sprite) {
                    var x = position.x + offset;
                    var y = position.y;
                    offset += sprite.width + 1;

                    sprite.renderToFrame(x, y, frame);
                }
                else {
                    console.error("Tried to print an unsupported letter: ", char);
                }
            });
        }
    });
});
