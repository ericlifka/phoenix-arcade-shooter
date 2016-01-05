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

        renderToFrame: function (x, y, frame) {

        }
    });
});
