DefineModule('models/text-display', function (require) {
    var ArcadeFont = require('fonts/arcade');
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.super('constructor', arguments);

            var message = options.message || "";
            if (typeof message === "string") {
                message = [ message ];
            }
            message = message.map(function (str) { return str.split(''); });

            this.message = message;
            this.position = options.position;
        },

        renderToFrame: function (frame) {
            var position = this.position;
            var offsetY = position.y;

            this.message.forEach(function (line) {
                var offsetX = position.x;

                line.forEach(function (char) {
                    var sprite = ArcadeFont[ char ];
                    if (sprite) {
                        sprite.renderToFrame(offsetX, offsetY, frame);
                        offsetX += sprite.width + 1;
                    }
                    else {
                        console.error("Tried to print an unsupported letter: '" + char + "'");
                    }
                });

                offsetY += ArcadeFont.meta.height + 4;
            });
        }
    });
});
