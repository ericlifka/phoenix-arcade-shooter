import GameObject from '../models/game-object.js';
import type ScriptChain from '../models/script-chain.js';

/**
 * Pauses a script chain for a fixed duration before advancing.
 */
export default class Wait extends GameObject {
    private duration: number;
    private elapsed = 0;

    constructor(parent: GameObject | null | undefined, durationSeconds: number) {
        super(parent);
        this.duration = durationSeconds;
    }

    start(): void {
        this.elapsed = 0;
    }

    update(dtime: number): void {
        this.elapsed += dtime / 1000;

        if (this.elapsed >= this.duration) {
            (this.parent as ScriptChain).removeChild();
        }
    }
}
