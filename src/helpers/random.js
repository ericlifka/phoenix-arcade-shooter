export function integer(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rangeCap(n, min, max) {
    if (typeof n !== "number" || n < min) {
        return min;
    }
    else if (n > max) {
        return max;
    }
    else {
        return n;
    }
}

export function sample(collection, requestedCount) {
    requestedCount = rangeCap(requestedCount, 1, collection.length);
    const range = collection.length - 1;
    const selected = {};
    let count = 0;
    let choice;

    while (count < requestedCount) {
        choice = integer(0, range);
        if (!selected[choice]) {
            selected[choice] = true;
            count++;
        }
    }

    return Object.keys(selected).map(function (key) {
        return collection[key];
    });
}
