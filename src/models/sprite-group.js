DefineModule('models/sprite-group', function (require) {
    return DefineClass({
        constructor: function (sprites) {
            this.spriteDescriptors = sprites || [];

            this.width = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
                return descriptor.x + descriptor.sprite.width;
            }));

            this.height = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
                return descriptor.y + descriptor.sprite.height;
            }));
        },

        update: function (dtime) {
            this.spriteDescriptors.forEach(function (descriptor) {
                if (typeof descriptor.sprite.update === "function") {
                    descriptor.sprite.update(dtime);
                }
            });
        },

        renderToFrame: function (x, y, frame) {
            this.spriteDescriptors.forEach(function (descriptor) {
                descriptor.sprite.renderToFrame(
                    x + descriptor.x,
                    y + descriptor.y,
                    frame
                );
            });
        }
    });
});
