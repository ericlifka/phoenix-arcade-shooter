DefineModule('helpers/pad-score-display', function () {
    return function (score) {
        score = score + "";
        switch (score.length) {
            case 0: score = "0" + score;
            case 1: score = "0" + score;
            case 2: score = "0" + score;
            case 3: score = "0" + score;
            case 4: score = "0" + score;
            case 5: score = "0" + score;
        }

        return score;
    };
});
