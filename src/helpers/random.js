DefineModule('helpers/random', function (require) {
    function integer(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function rangeCap(n, min, max) {
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

    function sample(collection, requestedCount) {
        requestedCount = rangeCap(requestedCount, 1, collection.length);
        var range = collection.length - 1;
        var selected = {};
        var count = 0;
        var choice;

        while (count < requestedCount) {
            choice = integer(0, range);
            if (!selected[ choice ]) {
                selected[ choice ] = true;
                count++;
            }
        }

        return Object.keys(selected).map(function (key) {
            return collection[ key ];
        });
    }

    return {
        integer: integer,
        rangeCap: rangeCap,
        sample: sample
    };
});
