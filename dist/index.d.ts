export { AssertionFailure, assert } from "./assert.js";
export type TestStatus = "passed" | "failed" | "errored" | "skipped" | "pending";
export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;
export type AroundHookFunction = (next: () => Promise<void>) => void | Promise<void>;
export interface Writer {
    write(text: string): void | Promise<void>;
}
export interface TestResult {
    suite_name: string;
    test_name: string;
    full_name: string;
    status: TestStatus;
    duration_ms: number;
    error?: unknown;
}
export interface SuiteResult {
    name: string;
    tests: TestResult[];
    duration_ms: number;
}
export interface RunResult {
    seed: string;
    status: "passed" | "failed";
    suites: SuiteResult[];
    tests: TestResult[];
    duration_ms: number;
}
export interface RunStartEvent {
    seed: string;
}
export interface SuiteStartEvent {
    suite_name: string;
}
export interface TestStartEvent {
    suite_name: string;
    test_name: string;
    full_name: string;
}
export interface TestResultEvent {
    result: TestResult;
}
export interface SuiteEndEvent {
    result: SuiteResult;
}
export interface RunEndEvent {
    result: RunResult;
}
export interface Reporter {
    run_start?(event: RunStartEvent): void | Promise<void>;
    suite_start?(event: SuiteStartEvent): void | Promise<void>;
    test_start?(event: TestStartEvent): void | Promise<void>;
    test_result?(event: TestResultEvent): void | Promise<void>;
    suite_end?(event: SuiteEndEvent): void | Promise<void>;
    run_end?(event: RunEndEvent): void | Promise<void>;
}
export type ReporterPreset = "progress" | "description";
export interface RunOptions {
    seed?: string;
    reporters?: Array<Reporter | ReporterPreset>;
    writer?: Writer;
    color?: boolean | "auto";
    set_exit_code?: boolean;
}
export interface ProgressReporterOptions {
    symbols?: Partial<Record<TestStatus, string>>;
}
export declare function progress_reporter(options?: ProgressReporterOptions, writer?: Writer, color?: boolean): Reporter;
export declare function summary_reporter(writer?: Writer): Reporter;
export declare function description_reporter(writer?: Writer): Reporter;
export declare function error_reporter(writer?: Writer): Reporter;
export declare function slow_test_reporter(writer?: Writer, limit?: number): Reporter;
export declare function suite(name: string, fn: () => void): void;
export declare function before(fn: HookFunction): void;
export declare function after(fn: HookFunction): void;
export declare function around(fn: AroundHookFunction): void;
export declare function test(name: string, fn: TestFunction): void;
export declare namespace test {
    var only: (name: string, fn: TestFunction) => void;
    var skip: (name: string, fn?: TestFunction) => void;
}
export declare const Microtest: {
    before(fn: HookFunction): void;
    after(fn: HookFunction): void;
    around(fn: AroundHookFunction): void;
};
export declare function run(options?: RunOptions): Promise<RunResult>;
