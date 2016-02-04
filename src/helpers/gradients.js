DefineModule('helpers/gradients', function (require) {
    function RGBtoHSV(color) {
        var R = color.R;
        var G = color.G;
        var B = color.B;

        var M = Math.max(R, G, B);
        var m = Math.min(R, G, B);
        var C = M - m;

        var Hp = 0;
        if (M === R) {
            Hp = (G - B) / C % 6;
        } else if (M === G) {
            Hp = (B - R) / C + 2;
        } else if (M === B) {
            Hp = (R - G) / C + 4;
        }

        var H = Hp * 60;
        var L = .5 * (M + m);
        var S = C / V;

        return {
            H: H,
            S: S,
            L: L
        };
    }

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
