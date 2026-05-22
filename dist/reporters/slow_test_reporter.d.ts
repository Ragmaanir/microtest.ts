import type { RunEndEvent } from "../events.js";
import type { Writer } from "./reporter.js";
import { TerminalReporter } from "./terminal_reporter.js";
export declare class SlowTestReporter extends TerminalReporter {
    private readonly limit;
    constructor(writer?: Writer, use_colors?: boolean, limit?: number);
    run_end(event: RunEndEvent): Promise<void>;
}
