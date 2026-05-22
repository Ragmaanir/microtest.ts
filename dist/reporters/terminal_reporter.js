import { TestStatus } from "../results.js";
import { Reporter } from "./reporter.js";
import { STDOUT_WRITER } from "./stdout_writer.js";
const DOT = "•";
const TICK = "✓";
const CROSS = "✕";
const BANG = "💥";
export const DOTS = {
    [TestStatus.Passed]: DOT,
    [TestStatus.Failed]: DOT,
    [TestStatus.Errored]: BANG,
    [TestStatus.Skipped]: DOT,
    [TestStatus.Pending]: DOT,
};
export const TICKS = {
    [TestStatus.Passed]: TICK,
    [TestStatus.Failed]: CROSS,
    [TestStatus.Errored]: BANG,
    [TestStatus.Skipped]: TICK,
    [TestStatus.Pending]: TICK,
};
export class TerminalReporter extends Reporter {
    writer;
    constructor(writer = STDOUT_WRITER, use_colors) {
        super();
        this.writer = writer;
        this.use_colors = use_colors !== false && process.env.COLOR !== "0";
    }
    use_colors;
    async write(text, color) {
        await this.writer.write(color?.colorize(text, this.use_colors) ?? text);
    }
    async writeln(text = "", color) {
        await this.writer.writeln(color?.colorize(text, this.use_colors) ?? text);
    }
}
