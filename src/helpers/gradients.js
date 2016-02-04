DefineModule('helpers/gradients', function () {
    return {
        GreenToRed: {
            start: 120,
            end: 0,
            inverted: true,
            S: 1,
            L: .5
        },

        colorAtPercent: function (gradient, percent) {
            if (gradient.inverted) {
                percent = 1 - percent;
            }

            var H = (gradient.end - gradient.start) * percent + gradient.start;
            var S = gradient.S * 100;
            var L = gradient.L * 100;

            H = Math.floor(H);
            S = Math.floor(S) + "%";
            L = Math.floor(L) + "%";

            return "hsl(" + H + ", " + S + ", " + L + ")";
        }
    };
});
