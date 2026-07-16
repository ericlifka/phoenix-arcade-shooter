/** Level Group 04 — dash-and-pause scouts. */

export const group04 = {
    bannerMs: 2000,

    /** Ship count = shipCountBase + rowCount * shipCountPerTier → 7, 10, 13, 16. */
    shipCountBase: 4,
    shipCountPerTier: 3,

    boundsLeft: 8,
    boundsRightInset: 8,
    boundsTop: 12,
    /** Fraction of screen height for scout playfield bottom. */
    boundsBottomFraction: 0.55,
    bossBoundsBottomFraction: 0.45,

    scout: {
        dashSpeed: 130,
        pauseSecondsMin: 0.55,
        pauseSecondsMax: 1.2,
        minDashDistance: 28,
        maxDashDistance: 75,
        burstFireRateMs: 110,
        /** burstSize = integer(1, rowCount + burstSizeRowBonus). */
        burstSizeRowBonus: 3
    },

    boss: {
        dashSpeed: 95,
        pauseSecondsMin: 0.8,
        pauseSecondsMax: 1.6,
        minDashDistance: 35,
        maxDashDistance: 90,
        spawnY: -30,
        bursts: [
            { gunIndex: 0, burstSize: 4, fireRateMs: 90 },
            { gunIndex: 1, burstSize: 5, fireRateMs: 70, windupMs: 40 },
            { gunIndex: 2, burstSize: 4, fireRateMs: 90 }
        ] as const
    },

    /** Opener level (has levelName / fly-in). */
    entryWaitOpenerMin: 1,
    entryWaitOpenerMax: 10,
    /** Follow-up levels 2–4 and boss. */
    entryWaitFollowUpMin: 0.5,
    entryWaitFollowUpMax: 5
};

export function group04ShipCount(rowCount: number): number {
    return group04.shipCountBase + rowCount * group04.shipCountPerTier;
}
