export class StdoutWriter {
    use_colors;
    static default(use_colors) {
        return use_colors === undefined ? STDOUT_WRITER : new StdoutWriter(use_colors);
    }
    constructor(use_colors = process.env.COLOR !== "0") {
        this.use_colors = use_colors;
    }
    write(text, color) {
        const output = color?.colorize(text, this.use_colors) ?? text;
        process.stdout.write(output);
    }
    writeln(text = "", color) {
        this.write(`${text}\n`, color);
    }
}
export const STDOUT_WRITER = new StdoutWriter();
