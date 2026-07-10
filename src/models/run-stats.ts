/**
 * Per-run statistics tracked during a single playthrough.
 */
export default class RunStats {
    pointsEarned = 0;
    enemiesDestroyed = 0;
    dollarsCollected = 0;
    dollarsSpent = 0;

    reset(): void {
        this.pointsEarned = 0;
        this.enemiesDestroyed = 0;
        this.dollarsCollected = 0;
        this.dollarsSpent = 0;
    }
}
