import GameObject from '../models/game-object.js';
import ArcadeFont from '../../libs/pxlr-fonts/fonts/arcade.js';

export default class MoneyDrop extends GameObject {
    isPhysicalEntity = true;
    type = "pickup";
    team = 1;
    index = 4;

    constructor(parent, position, velocity) {
        super(parent);

        this.value = 10;
        this.position = position;
        this.velocity = { x: 0, y: 50 };
        this.sprite = ArcadeFont[ '$' ];
        
        this.reset();
    }

    checkBoundaries() {
        if (this.position.x < 0
            || this.position.y < 0
            || this.position.x > this.parent.width
            || this.position.y > this.parent.height) {

            this.destroy();
        }
    }

    applyDamage(damage, sourceEntity) {
        if (sourceEntity.type === "player") {
            this.triggerEvent('moneyCollected', this.value);
            this.destroy();
        }
    }
}
