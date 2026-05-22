import { GREEN, RED, YELLOW } from "../color.js";
import { TestStatus } from "../results.js";
import { STDOUT_WRITER } from "./stdout_writer.js";
import { TerminalReporter, TICKS } from "./terminal_reporter.js";
export class DescriptionReporter extends TerminalReporter {
    symbols;
    constructor(options = {}, writer = STDOUT_WRITER) {
        super(writer);
        this.symbols = options.symbols ?? TICKS;
    }
    async suite_start(event) {
        await this.writeln(event.suite_name);
    }
    async test_result(event) {
        const symbol = this.symbols[event.result.status];
        const color = this.result_color(event.result.status);
        await this.write("  ");
        await this.write(symbol, color);
        await this.writeln(` ${event.result.test_name}`);
    }
    result_color(status) {
        switch (status) {
            case TestStatus.Passed:
                return GREEN;
            case TestStatus.Failed:
            case TestStatus.Errored:
                return RED;
            case TestStatus.Pending:
            case TestStatus.Skipped:
                return YELLOW;
        }
    }
}
