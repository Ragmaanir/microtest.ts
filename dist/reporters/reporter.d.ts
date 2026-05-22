import type { RunEndEvent, RunStartEvent, SuiteEndEvent, SuiteStartEvent, TestResultEvent, TestStartEvent } from "../events.js";
export declare abstract class Reporter {
    run_start?(event: RunStartEvent): void | Promise<void>;
    suite_start?(event: SuiteStartEvent): void | Promise<void>;
    test_start?(event: TestStartEvent): void | Promise<void>;
    test_result?(event: TestResultEvent): void | Promise<void>;
    suite_end?(event: SuiteEndEvent): void | Promise<void>;
    run_end?(event: RunEndEvent): void | Promise<void>;
}
