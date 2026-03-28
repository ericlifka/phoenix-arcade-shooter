import Animation from '../../rendering/core/animation.js';
import { integer } from '../../helpers/random.js';
import Sprite from '../../rendering/core/sprite.js';

const n = null;
const y = "yellow";
const o = "orange";
const r = "red";

function newFrameSet(): any[] {
    const frames = [
        new Sprite([
            [ n, n, n, n, n ],
            [ n, n, n, n, n ],
            [ n, n, r, n, n ],
            [ n, n, n, n, n ],
            [ n, n, n, n, n ]
        ]),
        new Sprite([
            [ n, n, n, n, n ],
            [ n, n, r, n, n ],
            [ n, y, y, o, n ],
            [ n, n, o, n, n ],
            [ n, n, n, n, n ]
        ]),
        new Sprite([
            [ y, n, r, n, n ],
            [ n, y, y, y, n ],
            [ o, y, n, y, o ],
            [ n, o, r, n, n ],
            [ n, n, y, y, n ]
        ]),
        new Sprite([
            [ y, n, y, n, n ],
            [ n, n, n, n, y ],
            [ n, n, n, n, y ],
            [ n, y, n, n, n ],
            [ n, n, y, y, n ]
        ]),
        new Sprite([
            [ n, n, n, y, n ],
            [ n, y, n, n, n ],
            [ n, n, n, n, n ],
            [ n, n, n, n, n ],
            [ y, n, n, n, y ]
        ])
    ];

    frames.forEach((frame) => {
        for (let i = 0, times = integer(0, 3); i < times; i++) {
            frame.rotateLeft();
        }
    });

    return frames;
}

/**
 * Creates a small explosion animation (5 frames of expanding fire)
 */
export default function smallExplosion(): any {
    return new Animation({
        frames: newFrameSet(),
        millisPerFrame: 50
    });
}
