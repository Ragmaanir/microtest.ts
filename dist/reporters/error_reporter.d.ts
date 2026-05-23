import type { RunEndEvent } from "../events.js";
import type { Writer } from "../writer.js";
import { TerminalReporter } from "./terminal_reporter.js";
export declare class ErrorReporter extends TerminalReporter {
    private readonly backtrace_printer;
    constructor(writer?: Writer);
    run_end(event: RunEndEvent): Promise<void>;
    private write_error;
}
