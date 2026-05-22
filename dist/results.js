export var TestStatus;
(function (TestStatus) {
    TestStatus["Passed"] = "passed";
    TestStatus["Failed"] = "failed";
    TestStatus["Errored"] = "errored";
    TestStatus["Skipped"] = "skipped";
    TestStatus["Pending"] = "pending";
})(TestStatus || (TestStatus = {}));
export class TestResult {
    suite_name;
    test_name;
    full_name;
    status;
    duration_ms;
    error;
    constructor(suite_name, test_name, full_name, status, duration_ms, error) {
        this.suite_name = suite_name;
        this.test_name = test_name;
        this.full_name = full_name;
        this.status = status;
        this.duration_ms = duration_ms;
        this.error = error;
    }
}
export class SuiteResult {
    name;
    tests;
    duration_ms;
    constructor(name, tests, duration_ms) {
        this.name = name;
        this.tests = tests;
        this.duration_ms = duration_ms;
    }
}
export class RunResult {
    seed;
    status;
    suites;
    tests;
    duration_ms;
    constructor(seed, status, suites, tests, duration_ms) {
        this.seed = seed;
        this.status = status;
        this.suites = suites;
        this.tests = tests;
        this.duration_ms = duration_ms;
    }
}
