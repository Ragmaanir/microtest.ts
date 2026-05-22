import { GREEN, RED, YELLOW } from "../color.js";
import { TestStatus } from "../results.js";
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
        if (status === TestStatus.Passed) {
            await this.write(symbol, GREEN);
        }
        else if (status === TestStatus.Failed || status === TestStatus.Errored) {
            await this.write(symbol, RED);
        }
        else {
            await this.write(symbol, YELLOW);
        }
    }
    async run_end() {
        await this.writeln();
    }
}
