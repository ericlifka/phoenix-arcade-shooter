/** Level Group 01 — rectangular formation blocks. */

export const group01 = {
    bannerMs: 2000,

    /** Column index range vs difficultyMultiplier (inclusive). */
    columnStartBase: 4,
    columnStartMin: 1,
    columnEndBase: 7,
    columnEndMax: 10,

    /** X = columnSpacing * i + columnOffsetX */
    columnSpacing: 10,
    columnOffsetX: 39,

    /** Enter-from-top Y per row (index 0 = rowCount 1). */
    enterY: [-40, -30, -20, -10] as const,
    /** Formation rest Y per row. */
    restY: [45, 55, 65, 75] as const,

    /** Base segment duration (seconds); paths use time and time*2. */
    moveTimeSeconds: 3,
    swayOffsetX: 40,
    swayOffsetY: 30,

    bossPatrolY: 1,
    bossPatrolLeftX: 1,
    bossPatrolRightMargin: 5,
    bossPatrolSeconds: 8
};

export function group01ColumnRange(difficultyMultiplier: number): { start: number; end: number } {
    let start = group01.columnStartBase - difficultyMultiplier;
    if (start < group01.columnStartMin) start = group01.columnStartMin;
    let end = group01.columnEndBase + difficultyMultiplier;
    if (end > group01.columnEndMax) end = group01.columnEndMax;
    return { start, end };
}
