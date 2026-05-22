import type { SuiteStartEvent, TestResultEvent } from "../events.js";
import type { Writer } from "./reporter.js";
import { type ResultSymbols, TerminalReporter } from "./terminal_reporter.js";
export declare class DescriptionReporter extends TerminalReporter {
    private readonly symbols;
    constructor(options?: {
        symbols?: ResultSymbols;
        use_colors?: boolean;
    }, writer?: Writer);
    suite_start(event: SuiteStartEvent): Promise<void>;
    test_result(event: TestResultEvent): Promise<void>;
    private result_color;
}
