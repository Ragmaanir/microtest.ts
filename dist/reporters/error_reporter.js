import { TestStatus } from "../results.js";
import { STDOUT_WRITER } from "./stdout_writer.js";
import { TerminalReporter } from "./terminal_reporter.js";
export class ErrorReporter extends TerminalReporter {
    constructor(writer = STDOUT_WRITER) {
        super(writer);
    }
    async run_end(event) {
        for (const result of event.result.tests) {
            if (result.status === TestStatus.Failed || result.status === TestStatus.Errored) {
                const message = result.error instanceof Error ? result.error.message : String(result.error);
                await this.writeln(`${result.full_name}: ${message}`);
            }
        }
    }
}
