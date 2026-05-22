export enum TestStatus {
  Passed = "passed",
  Failed = "failed",
  Errored = "errored",
  Skipped = "skipped",
  Pending = "pending",
}

export class TestResult {
  constructor(
    readonly suite_name: string,
    readonly test_name: string,
    readonly full_name: string,
    readonly status: TestStatus,
    readonly duration_ms: number,
    readonly error?: unknown,
  ) {}
}

export class SuiteResult {
  constructor(
    readonly name: string,
    readonly tests: TestResult[],
    readonly duration_ms: number,
  ) {}
}

export class RunResult {
  constructor(
    readonly seed: string,
    readonly status: "passed" | "failed",
    readonly suites: SuiteResult[],
    readonly tests: TestResult[],
    readonly duration_ms: number,
  ) {}
}
