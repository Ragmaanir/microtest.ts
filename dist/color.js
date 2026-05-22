export class RGB {
    r;
    g;
    b;
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    colorize(text, enabled = true) {
        if (!enabled) {
            return text;
        }
        return `\u001b[38;2;${this.r};${this.g};${this.b}m${text}\u001b[0m`;
    }
}
export const GREEN = new RGB(80, 220, 120);
export const RED = new RGB(240, 80, 80);
export const YELLOW = new RGB(230, 190, 80);
export const GRAY = new RGB(140, 140, 140);
