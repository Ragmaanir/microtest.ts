import type { TestResultEvent } from "../events.js";
import type { Writer } from "./reporter.js";
import { type ResultSymbols, TerminalReporter } from "./terminal_reporter.js";
export declare class ProgressReporter extends TerminalReporter {
    private readonly symbols;
    constructor(options?: {
        symbols?: ResultSymbols;
    }, writer?: Writer, use_colors?: boolean);
    test_result(event: TestResultEvent): Promise<void>;
    run_end(): Promise<void>;
}
