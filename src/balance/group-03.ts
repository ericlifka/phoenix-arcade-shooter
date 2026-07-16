/** Level Group 03 — dual orbits with concentric rings. */

export const group03 = {
    bannerMs: 2000,

    centerX: 100,
    splitY: 60,
    leftOrbit: { x: 55, y: 60 },
    rightOrbit: { x: 145, y: 60 },

    orbitRadius: 45,
    innerOrbitRadius: 33,
    innermostOrbitRadius: 21,

    staggerSeconds: 0.5,
    descentSeconds: 3,
    peelSeconds: 2,
    orbitPeriodSeconds: 8,

    centerProcessionShipCount: 16,
    outerProcessionShipCount: 8,
    innermostProcessionShipCount: 8,

    bossOrbitRadius: 36,
    bossEnterSeconds: 2,
    bossOrbitPeriodSeconds: 6,

    /** First shot after (pathSeconds - fireDelaySlackSeconds) * 1000. */
    fireDelaySlackSeconds: 2
};
