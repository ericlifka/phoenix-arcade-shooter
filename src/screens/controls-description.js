import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';

export default class ControlsDescription extends GameObject {
    headerDef = {
        font: "arcade",
        message: "Controls",
        color: "white",
        position: { x: 5, y: 5 }
    };

    inputDescriptions = [
        {
            message: [ "", "Move", "Fire" ],
            position: { x: 5, y: 20 }
        },
        {
            message: [ "- Keyboard", "- WASD", "- Space" ],
            position: { x: 35, y: 20 }
        },
        {
            message: [ "- Controller", "- Left Stick", "- A" ],
            position: { x: 85, y: 20 }
        }
    ];

    constructor(parent) {
        super(parent);
        this.reset();
    }

    reset() {
        super.reset();

        this.addChild(new TextDisplay(this, this.headerDef));

        this.inputDescriptions.forEach(function (item) {
            this.addChild(new TextDisplay(this, {
                font: "arcade-small",
                color: "#F6EC9A",
                message: item.message,
                position: item.position
            }))
        }.bind(this));

        this.addChild(new EventedInput({
            onSelect: this.onSelect.bind(this)
        }));
    }

    onSelect() {
        this.parent.reset();
    }
}
