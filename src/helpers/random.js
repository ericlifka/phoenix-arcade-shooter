DefineModule('helpers/random', function (require) {
    function integer(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function sample(collection, requestedCount) {
        requestedCount = requestedCount || 1;

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
        sample: sample
    };
});
