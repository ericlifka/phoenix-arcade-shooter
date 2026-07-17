/**
 * Enemy combat stats vs difficultyMultiplier (dm).
 *
 * Current policy: dm mainly scales HP and contact damage (and additive bullet damage).
 * Wave density / path speed / fire rates are per-group and usually ignore dm
 * (Group 01 column width is the main density exception).
 */

export const arrowScout = {
    contactDamage: (dm: number) => 30 + dm,
    life: (dm: number) => dm,
    bulletDamage: (dm: number) => 4 + dm,
    bulletSpeed: 100
};

export const arrowBoss = {
    contactDamage: (dm: number) => 50 * dm,
    life: (dm: number) => 75 + 25 * dm,
    bulletDamage: (dm: number) => 9 + dm,
    bulletSpeed: 125
};

export const dashScout = {
    contactDamage: (dm: number) => 15 + dm,
    life: (dm: number) => dm + 2,
    bulletDamage: (dm: number) => 3 + dm * 2,
    bulletSpeed: 125
};

export const dashBoss = {
    contactDamage: (dm: number) => 40 * dm,
    life: (dm: number) => 100 + 50 * dm,
    bulletDamage: (dm: number) => 5 + dm * 2,
    bulletSpeed: 150
};
