import Sprite from './sprite.js';

export default class SpriteGroup {
    spriteDescriptors: { x: number; y: number; sprite: Sprite }[];
    width: number;
    height: number;
    finished = false;

    constructor(sprites: { x: number; y: number; sprite: Sprite }[]) {
        this.spriteDescriptors = sprites || [];

        this.width = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
            return descriptor.x + descriptor.sprite.width;
        }));

        this.height = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
            return descriptor.y + descriptor.sprite.height;
        }));
    }

    update(dtime: number): void {
        let finished = true;

        this.spriteDescriptors.forEach(function (descriptor) {
            descriptor.sprite.update(dtime);

            if (!descriptor.sprite.finished) {
                finished = false;
            }
        });

        this.finished = finished;
    }

    renderToFrame(frame: any, x: number, y: number, index: number): void {
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
