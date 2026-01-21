export default class SpriteGroup {
    constructor(sprites) {
        this.spriteDescriptors = sprites || [];

        this.width = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
            return descriptor.x + descriptor.sprite.width;
        }));

        this.height = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
            return descriptor.y + descriptor.sprite.height;
        }));
    }

    update(dtime) {
        let finished = true;

        this.spriteDescriptors.forEach(function (descriptor) {
            descriptor.sprite.update(dtime);

            if (!descriptor.sprite.finished) {
                finished = false;
            }
        });

        this.finished = finished;
    }

    renderToFrame(frame, x, y, index) {
        this.spriteDescriptors.forEach(function (descriptor) {
            descriptor.sprite.renderToFrame(
                frame,
                x + descriptor.x,
                y + descriptor.y,
                index
            );
        });
    }
}
