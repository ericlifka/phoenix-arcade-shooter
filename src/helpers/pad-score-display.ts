/**
 * Pad a score with leading zeros to display at least 6 digits
 */
export default function padScoreDisplay(score: number): string {
    let scoreStr = score + "";
    switch (scoreStr.length) {
        case 0: scoreStr = "0" + scoreStr;
        case 1: scoreStr = "0" + scoreStr;
        case 2: scoreStr = "0" + scoreStr;
        case 3: scoreStr = "0" + scoreStr;
        case 4: scoreStr = "0" + scoreStr;
        case 5: scoreStr = "0" + scoreStr;
    }

    return scoreStr;
}
