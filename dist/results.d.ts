export declare enum TestStatus {
    Passed = "passed",
    Failed = "failed",
    Errored = "errored",
    Skipped = "skipped",
    Pending = "pending"
}
export declare class TestResult {
    readonly suite_name: string;
    readonly test_name: string;
    readonly full_name: string;
    readonly status: TestStatus;
    readonly duration_ms: number;
    readonly error?: unknown | undefined;
    constructor(suite_name: string, test_name: string, full_name: string, status: TestStatus, duration_ms: number, error?: unknown | undefined);
}
export declare class SuiteResult {
    readonly name: string;
    readonly tests: TestResult[];
    readonly duration_ms: number;
    constructor(name: string, tests: TestResult[], duration_ms: number);
}
export declare class RunResult {
    readonly seed: string;
    readonly status: "passed" | "failed";
    readonly suites: SuiteResult[];
    readonly tests: TestResult[];
    readonly duration_ms: number;
    constructor(seed: string, status: "passed" | "failed", suites: SuiteResult[], tests: TestResult[], duration_ms: number);
}
