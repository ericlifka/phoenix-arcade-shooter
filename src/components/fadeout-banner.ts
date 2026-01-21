import GameObject from '../models/game-object.js';
import TextDisplay from './text-display.js';

const colorGradient = [
    "rgb(255,255,255)",
    "rgb(226,226,232)",
    "rgb(171,171,189)",
    "rgb(142,142,165)",
    "rgb(114,113,142)",
    "rgb(85,84,119)",
    "rgb(58,57,97)",
    "rgb(29,27,74)",
    "rgb(1,0,51)"
];

/**
 * Banner text that fades out over time (used for level names)
 */
export default class FadeoutBanner extends GameObject {
    private text: string;
    private interval: number;
    private elapsedTime: number = 0;
    private colorIndex: number = 0;
    private textDisplay!: TextDisplay;

    constructor(parent: GameObject, text: string, time: number) {
        super(parent);

        this.text = text;
        this.interval = time / colorGradient.length;
        
        this.reset();
    }

    start(): void {
        this.elapsedTime = 0;
        this.colorIndex = 0;

        this.textDisplay = new TextDisplay(this, {
            message: this.text,
            position: { x: 55, y: 50 },
            border: true,
            padding: 15,
            color: colorGradient[ this.colorIndex ],
            font: "arcade"
        });
        this.addChild(this.textDisplay);
    }

    update(dtime: number): void {
        this.elapsedTime += dtime;

        if (this.elapsedTime > this.interval) {
            this.elapsedTime -= this.interval;
            this.colorIndex++;

            if (this.colorIndex > colorGradient.length) {
                this.parent?.removeChild(this);
            } else if (this.textDisplay) {
                this.textDisplay.updateColor(colorGradient[ this.colorIndex ]);
            }
        }
    }
}
