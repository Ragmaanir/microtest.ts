import type { RunEndEvent } from "../events.js";
import type { Writer } from "./reporter.js";
import { TerminalReporter } from "./terminal_reporter.js";
export declare class SummaryReporter extends TerminalReporter {
    constructor(writer?: Writer, use_colors?: boolean);
    run_end(event: RunEndEvent): Promise<void>;
}
