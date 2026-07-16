/** Level Group 02 — serpentine side-entry parade. */

export const group02 = {
    bannerMs: 2000,

    /** Path geometry (pixels). */
    pathLeft: 4,
    pathInner: 20,
    pathRight: 182,
    pathTop: 4,
    laneGap: 14,
    enterX: -24,

    /** Parade movement. */
    pathSpeed: 40,
    staggerSeconds: 0.45,

    /** Ship count = shipsPerTierBase * (rowCount + 1) → 16, 24, 32, 40. */
    shipsPerTierBase: 8,

    /** Lane count = min(laneBase + rowCount * laneStep, laneMax); must stay even. */
    laneBase: 2,
    laneStep: 2,
    laneMax: 8,

    /** Extra seconds after stagger before first shot: (delay + fireDelayPadding) * 1000. */
    fireDelayPaddingSeconds: 1.5
};

export function group02ShipCount(rowCount: number): number {
    return group02.shipsPerTierBase * (rowCount + 1);
}

export function group02LaneCount(rowCount: number): number {
    return Math.min(group02.laneBase + rowCount * group02.laneStep, group02.laneMax);
}
