import { STDOUT_WRITER } from "./stdout_writer.js";
import { DOTS, TerminalReporter } from "./terminal_reporter.js";
export class ProgressReporter extends TerminalReporter {
    symbols;
    constructor(options = {}, writer = STDOUT_WRITER) {
        super(writer);
        this.symbols = options.symbols ?? DOTS;
    }
    async test_result(event) {
        const status = event.result.status;
        const symbol = this.symbols[status];
        await this.write(symbol, TerminalReporter.DEFAULT_TEST_STATUS_COLORS[status]);
    }
    async run_end() {
        await this.writeln();
    }
}
