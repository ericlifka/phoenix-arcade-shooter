/** Default options for firing / dash-movement scripts (overridable per level). */

export const randomRateFire = {
    thresholdMinMs: 1000,
    thresholdMaxMs: 3000,
    initialDelayMs: 0
};

export const chainGunFire = {
    fireRateMs: 150,
    burstSize: 5,
    thresholdMinMs: 2000,
    thresholdMaxMs: 6000
};

export const burstOnPause = {
    burstSize: 3,
    fireRateMs: 120,
    windupMs: 80
};

export const dashAndPause = {
    dashSpeed: 120,
    pauseSecondsMin: 0.8,
    pauseSecondsMax: 1.6,
    telegraphSeconds: 0.38,
    minDashDistance: 25,
    maxDashDistance: 70,
    initialWaitSecondsMin: 1,
    initialWaitSecondsMax: 10
};
