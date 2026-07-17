import { InputState } from '../types/game';

interface EventedInputOptions {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    onFire?: () => void;
    onStart?: () => void;
    onSelect?: () => void;
}

/**
 * Handles edge-triggered input events (fires once on press/release)
 * Used for menu navigation and similar UI interactions
 */
export default class EventedInput {
    private onUp: () => void;
    private onDown: () => void;
    private onLeft: () => void;
    private onRight: () => void;
    private onFire: () => void;
    private onStart: () => void;
    private onSelect: () => void;

    private upReleased: boolean = false;
    private downReleased: boolean = false;
    private leftReleased: boolean = false;
    private rightReleased: boolean = false;
    private fireReleased: boolean = false;
    private startReleased: boolean = false;

    constructor(options: EventedInputOptions) {
        this.onUp = options.onUp || function () { };
        this.onDown = options.onDown || function () { };
        this.onLeft = options.onLeft || function () { };
        this.onRight = options.onRight || function () { };
        this.onFire = options.onFire || function () { };
        this.onStart = options.onStart || function () { };
        this.onSelect = options.onSelect || function () { };

        this.reset();
    }

    reset(): void {
        this.upReleased = false;
        this.downReleased = false;
        this.leftReleased = false;
        this.rightReleased = false;
        this.fireReleased = false;
        this.startReleased = false;
    }

    processInput(input: InputState): void {
        if (input.movementVector.y < .6) {
            this.downReleased = true;
        }
        if (input.movementVector.y > -.6) {
            this.upReleased = true;
        }
        if (input.movementVector.x < .6) {
            this.rightReleased = true;
        }
        if (input.movementVector.x > -.6) {
            this.leftReleased = true;
        }
        if (!input.start) {
            this.startReleased = true;
        }
        if (!input.fire) {
            this.fireReleased = true;
        }

        if (input.movementVector.y >= .6 && this.downReleased) {
            this.downReleased = false;
            this.onDown();
        }
        if (input.movementVector.y <= -.6 && this.upReleased) {
            this.upReleased = false;
            this.onUp();
        }
        if (input.movementVector.x >= .6 && this.rightReleased) {
            this.rightReleased = false;
            this.onRight();
        }
        if (input.movementVector.x <= -.6 && this.leftReleased) {
            this.leftReleased = false;
            this.onLeft();
        }
        if (input.start && this.startReleased) {
            this.startReleased = false;
            this.onStart();
            this.onSelect();
        }
        if (input.fire && this.fireReleased) {
            this.fireReleased = false;
            this.onFire();
            this.onSelect();
        }
    }
}
