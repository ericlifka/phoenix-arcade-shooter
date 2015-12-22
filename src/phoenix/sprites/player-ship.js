DefineModule('phoenix/sprites/player-ship', function (require) {
    return function () {
        var w = "white";
        var n = null;
        return newSprite([
            [n, n, n, w, n, n, n],
            [n, n, n, w, n, n, n],
            [n, n, w, w, w, n, n],
            [n, n, w, w, w, n, n],
            [w, n, w, w, w, n, w],
            [w, n, w, w, w, n, w],
            [w, w, w, w, w, w, w],
            [n, n, w, w, w, n, n],
            [n, n, n, w, n, n, n]
        ]);
    }
});
