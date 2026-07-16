/**
 * Enemy combat stats vs difficultyMultiplier (dm).
 *
 * Current policy: dm mainly scales HP and contact damage (and additive bullet damage).
 * Wave density / path speed / fire rates are per-group and usually ignore dm
 * (Group 01 column width is the main density exception).
 */

export const arrowScout = {
    contactDamage: (dm: number) => 4 + dm,
    life: (dm: number) => dm,
    bulletDamage: (dm: number) => 4 + dm,
    bulletSpeed: 100
};

export const arrowBoss = {
    contactDamage: (dm: number) => 50 * dm,
    life: (dm: number) => 20 * dm,
    bulletDamage: (dm: number) => 4 + dm,
    bulletSpeed: 120
};

export const dashScout = {
    contactDamage: (dm: number) => 5 + dm,
    life: (dm: number) => dm,
    bulletDamage: (dm: number) => 4 + dm,
    bulletSpeed: 110
};

export const dashBoss = {
    contactDamage: (dm: number) => 40 * dm,
    life: (dm: number) => 18 * dm,
    bulletDamage: (dm: number) => 5 + dm,
    bulletSpeed: 130
};
