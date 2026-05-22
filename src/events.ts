import type { RunResult, SuiteResult, TestResult } from "./results.js"

export interface RunStartEvent {
  seed: string
}

export interface SuiteStartEvent {
  suite_name: string
}

export interface TestStartEvent {
  suite_name: string
  test_name: string
  full_name: string
}

export interface TestResultEvent {
  result: TestResult
}

export interface SuiteEndEvent {
  result: SuiteResult
}

export interface RunEndEvent {
  result: RunResult
}
