import Sprite from '../rendering/core/sprite.js';
import spriteFromCharMap from './char-map.js';

/*
 * Celestial bodies for the level select map. Both are lit from the upper left
 * with a shadowed crescent on the right limb, so they read as spheres against
 * the '#000031' play field rather than as flat discs.
 */

const n = null;

/**
 * Earth, 29x29.
 * o/O/d ocean (mid / lit / shadowed), l/L/k land, i/I ice cap.
 */
export function earthSprite(): Sprite {
    return spriteFromCharMap([
        '..........iiiiiiiii..........',
        '........oiiiiiiiiiiio........',
        '......ooooiiiiiiiiioood......',
        '.....oolLLLloooooooooood.....',
        '....ooLLLLLLLoooooooooodd....',
        '...ooOLLLLLLLLoooooooooodd...',
        '..ooOOOLLLLLLLOoolllooooddd..',
        '..ooOOOOLLLLLOOollllloooddd..',
        '.ooOOOOOOLLLLOOLlllllloooddd.',
        '.ooOOOOOOOLLLOOLlllllloooddd.',
        'oooOOOOOOOOLLLLLllllloooodddd',
        'ooooOOOOOOOLLLLlllllooooodddd',
        'ooooOOOOOOOOLLOlllllloooodddd',
        'oooooOOOOOOOLLlollllllooodddd',
        'ooooooOOOOOLLloollllllloodddd',
        'ooooooooOOLllloollllllloodddd',
        'oooooooooollllolllllllooodddd',
        'ooooooooooolllolllllloooddddd',
        'ooooooooooollloollllooooddddd',
        '.ooooooooooolllolllooooodddd.',
        '.ooooooooooolllooooooooddddd.',
        '..ooooooooooolllooooooodddd..',
        '..ooooooooooolllooooooddddd..',
        '...oooooooooollllooooddddd...',
        '....oooooooooollloooddddd....',
        '.....ooooooooooooooddddd.....',
        '......ooooiiiiiiiiIdddd......',
        '........oiiiiiiiiIIId........',
        '..........iiiiiIIII..........'
    ], {
        '.': n,
        o: '#2a6bb0',
        O: '#4a92d8',
        d: '#16406f',
        l: '#3f8f4c',
        L: '#63bd64',
        k: '#265b31',
        i: '#dbeef5',
        I: '#8fb2c4'
    });
}

/**
 * Luna, 15x15.
 * g/G/d regolith (mid / lit / shadowed), c/k craters.
 */
export function moonSprite(): Sprite {
    return spriteFromCharMap([
        '.....ggggg.....',
        '...GGGgggggg...',
        '..GGGGccggggd..',
        '.GGccccccggggd.',
        '.Gccccccgggggd.',
        'gGGccGGGgggggdd',
        'ggGGGGGgcccggdd',
        'gggGGGggccccgdd',
        'gggccggggccggdd',
        'gggcccgggggggdd',
        '.gggccggccggdd.',
        '.gggggggccggdd.',
        '..gggggggggdd..',
        '...gggggggdd...',
        '.....ggggd.....'
    ], {
        '.': n,
        g: '#9a9a93',
        G: '#c9c9c0',
        c: '#6f6f6a',
        d: '#4e4e4c',
        k: '#3a3a38'
    });
}

/**
 * Mars, 15x15. Placeholder red sphere with a darker crater/limb shadow.
 */
export function marsSprite(): Sprite {
    return spriteFromCharMap([
        '.....rrrrr.....',
        '...RRRrrrrrr...',
        '..RRRRrrrrrrr..',
        '.RRRRRRrrrrrrr.',
        '.RRRRRRrrrrrrr.',
        'rRRRRRRrrrrrrrr',
        'rrRRRRRrrrrrrrr',
        'rrrrrrrrrrrrrrr',
        'rrrrrrrrrrrrrrr',
        'rrrrrrrrrrrrrrr',
        '.rrrrrrrrrrrrr.',
        '.rrrrrrrrrrrrr.',
        '..rrrrrrrrrrr..',
        '...rrrrrrrrr...',
        '.....rrrrr.....'
    ], {
        '.': n,
        r: '#a53a2a',
        R: '#c44a36'
    });
}

export const EARTH_SIZE = 29;
export const MOON_SIZE = 15;
export const MARS_SIZE = 15;
