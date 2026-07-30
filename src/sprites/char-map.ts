import Sprite from '../rendering/core/sprite.js';

/**
 * Build a sprite from rows of characters authored top-to-bottom, left-to-right.
 *
 * `Sprite` stores pixels column-major (`pixels[x][y]`), which is unreadable to
 * hand-author much past ship size. Char maps stay readable at planet size:
 *
 *     spriteFromCharMap([
 *         '.oo.',
 *         'olo.'
 *     ], { '.': null, o: '#2f6fc0', l: '#3d8f4a' });
 *
 * Every character in the rows must have a palette entry; a `null` entry is a
 * transparent pixel. Rows are padded to the longest row with transparency.
 */
export default function spriteFromCharMap(
    rows: string[],
    palette: Record<string, string | null>
): Sprite {
    const height = rows.length;
    const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const pixels: (string | null)[][] = [];

    for (let x = 0; x < width; x++) {
        pixels[x] = [];
        for (let y = 0; y < height; y++) {
            const char = rows[y][x];

            if (char === undefined) {
                pixels[x][y] = null;
                continue;
            }

            if (!(char in palette)) {
                console.error("Char map used a character with no palette entry: '" + char + "'");
                pixels[x][y] = null;
                continue;
            }

            pixels[x][y] = palette[char];
        }
    }

    return new Sprite(pixels);
}
