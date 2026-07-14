/**
 * Generate a random integer between min and max (inclusive)
 */
export function integer(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp a number between min and max values
 */
export function rangeCap(n: number, min: number, max: number): number {
    if (typeof n !== "number" || n < min) {
        return min;
    }
    else if (n > max) {
        return max;
    }
    else {
        return Math.round(n);
    }
}

/**
 * Randomly sample items from a collection without replacement
 */
export function sample<T>(collection: T[], requestedCount: number): T[] {
    requestedCount = rangeCap(requestedCount, 1, collection.length);
    const range = collection.length - 1;
    const selected: Record<number, boolean> = {};
    let count = 0;
    let choice: number;

    while (count < requestedCount) {
        choice = integer(0, range);
        if (!selected[choice]) {
            selected[choice] = true;
            count++;
        }
    }

    return Object.keys(selected).map((key) => {
        return collection[parseInt(key)];
    });
}
