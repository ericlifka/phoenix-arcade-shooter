import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import { TextDisplayOptions } from '../types/game';
import { Position } from '../types/rendering';

interface ControlsParent extends GameObject {
    reset(): void;
}

interface InputDescriptionRow {
    message: string[];
    position: Position;
}

export default class ControlsDescription extends GameObject {
    headerDef: TextDisplayOptions = {
        font: 'arcade',
        message: 'Controls',
        color: 'white',
        position: { x: 5, y: 5 }
    };

    inputDescriptions: InputDescriptionRow[] = [
        {
            message: ['', 'Move', 'Fire'],
            position: { x: 5, y: 20 }
        },
        {
            message: ['- Keyboard', '- WASD', '- Space'],
            position: { x: 35, y: 20 }
        },
        {
            message: ['- Controller', '- Left Stick', '- A'],
            position: { x: 85, y: 20 }
        }
    ];

    constructor(parent?: GameObject | null) {
        super(parent);
        this.reset();
    }

    reset(): void {
        super.reset();

        this.addChild(new TextDisplay(this, this.headerDef));

        this.inputDescriptions.forEach(function (this: ControlsDescription, item: InputDescriptionRow) {
            this.addChild(new TextDisplay(this, {
                font: 'arcade-small',
                color: '#F6EC9A',
                message: item.message,
                position: item.position
            }));
        }.bind(this));

        this.addChild(new EventedInput({
            onSelect: this.onSelect.bind(this)
        }) as unknown as GameObject);
    }

    onSelect(): void {
        (this.parent as ControlsParent).reset();
    }
}
