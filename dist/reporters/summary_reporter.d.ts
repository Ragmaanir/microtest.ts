import type { RunEndEvent } from "../events.js";
import type { Writer } from "../writer.js";
import { TerminalReporter } from "./terminal_reporter.js";
export declare class SummaryReporter extends TerminalReporter {
    constructor(writer?: Writer);
    run_end(event: RunEndEvent): Promise<void>;
}
