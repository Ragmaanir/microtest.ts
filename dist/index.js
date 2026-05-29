export { AssertionFailure, assert } from "./assert.js";
export { BacktraceEntry, BacktraceKind, BacktracePrinter } from "./backtrace_printer.js";
export { ExecutionContext } from "./execution_context.js";
export { Path } from "./path.js";
export { Rand } from "./rand.js";
export { DescriptionReporter, DOTS, ErrorReporter, ProgressReporter, SlowTestReporter, SummaryReporter, TICKS, } from "./reporters.js";
export { RunResult, SuiteResult, TestResult, TestStatus } from "./results.js";
export { Suite } from "./suite.js";
export { TestCase } from "./test_case.js";
import { ExecutionContext } from "./execution_context.js";
const CONTEXT_KEY = "__microtest_context__";
const microtest_global = globalThis;
const context = microtest_global[CONTEXT_KEY] ?? new ExecutionContext();
microtest_global[CONTEXT_KEY] = context;
export function suite(name, fn) {
    context.suite(name, fn);
}
export function before(fn) {
    context.before(fn);
}
export function after(fn) {
    context.after(fn);
}
export function around(fn) {
    context.around(fn);
}
export function test(name, fn) {
    context.test(name, fn, false, false);
}
test.only = (name, fn) => {
    context.test(name, fn, true, false);
};
test.skip = (name, fn) => {
    context.test(name, fn, false, true);
};
export const Microtest = {
    before(fn) {
        context.global_before(fn);
    },
    after(fn) {
        context.global_after(fn);
    },
    around(fn) {
        context.global_around(fn);
    },
};
export async function run(options = {}) {
    return await context.run(options);
}
