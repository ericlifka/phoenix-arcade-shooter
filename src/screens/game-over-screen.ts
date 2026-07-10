import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import padScoreDisplay from '../helpers/pad-score-display.js';
import RunStats from '../models/run-stats.js';
import TextDisplay from '../components/text-display.js';
import { TextDisplayOptions } from '../types/game';

interface GameOverParent extends GameObject {
    finishGame(): void;
}

const STAT_LABELS = ['Score', 'Kills', 'Earned', 'Spent'];
const STAT_LINE_Y = [52, 62, 72, 82];
const STAT_LABEL_X = 20;
const STAT_VALUE_RIGHT = 180;

export default class GameOverScreen extends GameObject {
    resultMessage: TextDisplayOptions = {
        font: 'arcade',
        message: 'GAME OVER',
        position: { x: 67, y: 18 }
    };
    headerDef: TextDisplayOptions = {
        font: 'arcade-small',
        message: '< hit enter >',
        position: { x: 75, y: 132 }
    };

    result: TextDisplay;
    header: TextDisplay;
    statLabels: TextDisplay[];
    statValues: TextDisplay[];
    inputEvents: EventedInput;
    private themeColor = '#fff';

    constructor(parent?: GameObject | null) {
        super(parent);

        this.result = new TextDisplay(this, this.resultMessage);
        this.header = new TextDisplay(this, this.headerDef);
        this.statLabels = STAT_LINE_Y.map((y, index) => new TextDisplay(this, {
            font: 'arcade-small',
            message: STAT_LABELS[index],
            position: { x: STAT_LABEL_X, y }
        }));
        this.statValues = STAT_LINE_Y.map((y) => new TextDisplay(this, {
            font: 'arcade-small',
            message: '',
            position: { x: STAT_VALUE_RIGHT, y }
        }));

        this.inputEvents = new EventedInput({
            onStart: this.onStart.bind(this)
        });

        this.reset();
    }

    reset(): void {
        super.reset();

        this.addChild(this.result);
        this.addChild(this.header);
        this.statLabels.forEach((line) => this.addChild(line));
        this.statValues.forEach((line) => this.addChild(line));
        this.addChild(this.inputEvents as unknown as GameObject);
        this.inputEvents.reset();
    }

    onStart(): void {
        (this.parent as GameOverParent).finishGame();
    }

    setResult(result: string): void {
        if (result === 'win') {
            this.themeColor = 'green';
            this.result.changeMessage('YOU WIN!');
        } else if (result === 'loss') {
            this.themeColor = 'red';
            this.result.changeMessage('GAME OVER');
        }

        this.applyThemeColor();
    }

    setRunStats(stats: RunStats): void {
        this.setRightAlignedValue(this.statValues[0], padScoreDisplay(stats.pointsEarned), STAT_LINE_Y[0]);
        this.setRightAlignedValue(this.statValues[1], String(stats.enemiesDestroyed), STAT_LINE_Y[1]);
        this.setRightAlignedValue(this.statValues[2], '$' + stats.dollarsCollected.toFixed(2), STAT_LINE_Y[2]);
        this.setRightAlignedValue(this.statValues[3], '$' + stats.dollarsSpent.toFixed(2), STAT_LINE_Y[3]);
        this.applyThemeColor();
    }

    private setRightAlignedValue(display: TextDisplay, text: string, y: number): void {
        display.position = { x: STAT_VALUE_RIGHT, y };
        display.changeMessage(text);

        const width = display.width;
        if (width !== undefined && display.position) {
            display.position.x = STAT_VALUE_RIGHT - width;
            display.changeMessage(text);
        }
    }

    private applyThemeColor(): void {
        this.result.updateColor(this.themeColor);
        this.header.updateColor(this.themeColor);
        this.statLabels.forEach((line) => line.updateColor(this.themeColor));
        this.statValues.forEach((line) => line.updateColor(this.themeColor));
    }
}
