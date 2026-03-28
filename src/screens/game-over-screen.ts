import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import padScoreDisplay from '../helpers/pad-score-display.js';
import TextDisplay from '../components/text-display.js';
import { TextDisplayOptions } from '../types/game';

interface GameOverParent extends GameObject {
    finishGame(): void;
}

export default class GameOverScreen extends GameObject {
    resultMessage: TextDisplayOptions = {
        font: 'arcade',
        message: 'GAME OVER',
        position: { x: 67, y: 53 }
    };
    headerDef: TextDisplayOptions = {
        font: 'arcade-small',
        border: true,
        padding: 20,
        message: '< hit enter >',
        position: { x: 55, y: 45 }
    };
    subHeaderDef: TextDisplayOptions = {
        font: 'arcade-small',
        message: 'Final Score:',
        position: { x: 68, y: 77 }
    };
    scoreDisplayDef: TextDisplayOptions = {
        font: 'arcade-small',
        message: '0',
        color: 'yellow',
        position: { x: 111, y: 77 }
    };

    result: TextDisplay;
    header: TextDisplay;
    subHeader: TextDisplay;
    scoreDisplay: TextDisplay;
    inputEvents: EventedInput;

    constructor(parent?: GameObject | null) {
        super(parent);

        this.result = new TextDisplay(this, this.resultMessage);
        this.header = new TextDisplay(this, this.headerDef);
        this.subHeader = new TextDisplay(this, this.subHeaderDef);
        this.scoreDisplay = new TextDisplay(this, this.scoreDisplayDef);

        this.inputEvents = new EventedInput({
            onStart: this.onStart.bind(this)
        });

        this.reset();
    }

    reset(): void {
        super.reset();

        this.addChild(this.result);
        this.addChild(this.header);
        this.addChild(this.subHeader);
        this.addChild(this.scoreDisplay);

        this.addChild(this.inputEvents as unknown as GameObject);
        this.inputEvents.reset();
    }

    onStart(): void {
        (this.parent as GameOverParent).finishGame();
    }

    setResult(result: string): void {
        if (result === 'win') {
            this.header.updateColor('green');
            this.result.updateColor('green');
            this.subHeader.updateColor('green');
            this.result.changeMessage('YOU WIN!');
        } else if (result === 'loss') {
            this.header.updateColor('red');
            this.result.updateColor('red');
            this.subHeader.updateColor('red');
            this.result.changeMessage('GAME OVER');
        }
    }

    setFinalScore(score: number): void {
        this.scoreDisplay.changeMessage(padScoreDisplay(score));
    }
}
