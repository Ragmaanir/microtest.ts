import { BacktracePrinter } from "../backtrace_printer.js";
import { TestStatus } from "../results.js";
import { STDOUT_WRITER } from "./stdout_writer.js";
import { TerminalReporter } from "./terminal_reporter.js";
export class ErrorReporter extends TerminalReporter {
    backtrace_printer = new BacktracePrinter();
    constructor(writer = STDOUT_WRITER) {
        super(writer);
    }
    async run_end(event) {
        for (const result of event.result.tests) {
            if (result.status === TestStatus.Failed || result.status === TestStatus.Errored) {
                await this.writeln(`${result.full_name}: ${this.error_message(result.error)}`);
            }
        }
    }
    error_message(error) {
        if (!(error instanceof Error)) {
            return String(error);
        }
        if (error.stack === undefined) {
            return error.message;
        }
        const [message, ...backtrace] = error.stack.split("\n");
        return `${message}\n${this.backtrace_printer.call(backtrace)}`;
    }
}
