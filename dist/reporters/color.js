export function colorize(text, color, enabled) {
    if (!enabled) {
        return text;
    }
    const codes = {
        green: 32,
        red: 31,
        yellow: 33,
        gray: 90,
    };
    return `\u001b[${codes[color]}m${text}\u001b[0m`;
}
export function should_use_color(option) {
    if (option === false || process.env.NO_COLOR !== undefined) {
        return false;
    }
    if (option === true || process.env.FORCE_COLOR === "1") {
        return true;
    }
    return process.stdout.isTTY === true;
}
