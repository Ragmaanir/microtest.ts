import { BacktracePrinter } from "../backtrace_printer.js";
import { RED, YELLOW } from "../color.js";
import { TestStatus } from "../results.js";
import { STDOUT_WRITER } from "./stdout_writer.js";
import { TerminalReporter } from "./terminal_reporter.js";
export class ErrorReporter extends TerminalReporter {
    backtrace_printer;
    constructor(writer = STDOUT_WRITER) {
        super(writer);
        this.backtrace_printer = new BacktracePrinter(writer);
    }
    async run_end(event) {
        for (const result of event.result.tests) {
            if (result.status === TestStatus.Failed || result.status === TestStatus.Errored) {
                await this.write(result.full_name, YELLOW);
                await this.write(": ");
                await this.write_error(result.error);
            }
        }
    }
    async write_error(error) {
        if (!(error instanceof Error)) {
            await this.writeln(String(error), RED);
            return;
        }
        if (error.stack === undefined) {
            await this.writeln(error.message, RED);
            return;
        }
        const [message, ...backtrace] = error.stack.split("\n");
        await this.writeln(message ?? error.message, RED);
        await this.backtrace_printer.call(backtrace);
    }
}
