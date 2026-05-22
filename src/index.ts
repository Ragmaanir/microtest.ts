export { AssertionFailure, assert } from "./assert.js"
export type {
  RunEndEvent,
  RunStartEvent,
  SuiteEndEvent,
  SuiteStartEvent,
  TestResultEvent,
  TestStartEvent,
} from "./events.js"
export type { RunOptions } from "./execution_context.js"
export { ExecutionContext } from "./execution_context.js"
export { Rand } from "./rand.js"
export type { Reporter, ResultSymbols, Writer } from "./reporters.js"
export {
  DescriptionReporter,
  DOTS,
  ErrorReporter,
  ProgressReporter,
  SlowTestReporter,
  SummaryReporter,
  TICKS,
} from "./reporters.js"
export { RunResult, SuiteResult, TestResult, TestStatus } from "./results.js"
export type { AroundHookFunction, HookFunction } from "./suite.js"
export { Suite } from "./suite.js"
export type { TestFunction } from "./test_case.js"
export { TestCase } from "./test_case.js"

import { ExecutionContext, type RunOptions } from "./execution_context.js"
import type { AroundHookFunction, HookFunction } from "./suite.js"
import type { TestFunction } from "./test_case.js"

const context = new ExecutionContext()

export function suite(name: string, fn: () => void): void {
  context.suite(name, fn)
}

export function before(fn: HookFunction): void {
  context.before(fn)
}

export function after(fn: HookFunction): void {
  context.after(fn)
}

export function around(fn: AroundHookFunction): void {
  context.around(fn)
}

export function test(name: string, fn: TestFunction): void {
  context.test(name, fn, false, false)
}

test.only = (name: string, fn: TestFunction): void => {
  context.test(name, fn, true, false)
}

test.skip = (name: string, fn?: TestFunction): void => {
  context.test(name, fn, false, true)
}

export const Microtest = {
  before(fn: HookFunction): void {
    context.global_before(fn)
  },
  after(fn: HookFunction): void {
    context.global_after(fn)
  },
  around(fn: AroundHookFunction): void {
    context.global_around(fn)
  },
}

export async function run(options: RunOptions = {}) {
  return await context.run(options)
}
