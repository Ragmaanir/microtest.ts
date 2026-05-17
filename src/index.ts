export { AssertionFailure, assert } from "./assert.js"

export type TestStatus = "passed" | "failed" | "errored" | "skipped" | "pending"
export type TestFunction = () => void | Promise<void>
export type HookFunction = () => void | Promise<void>
export type AroundHookFunction = (next: () => Promise<void>) => void | Promise<void>

export interface Writer {
  write(text: string): void | Promise<void>
}

export interface TestResult {
  suite_name: string
  test_name: string
  full_name: string
  status: TestStatus
  duration_ms: number
  error?: unknown
}

export interface SuiteResult {
  name: string
  tests: TestResult[]
  duration_ms: number
}

export interface RunResult {
  seed: string
  status: "passed" | "failed"
  suites: SuiteResult[]
  tests: TestResult[]
  duration_ms: number
}

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

export interface Reporter {
  run_start?(event: RunStartEvent): void | Promise<void>
  suite_start?(event: SuiteStartEvent): void | Promise<void>
  test_start?(event: TestStartEvent): void | Promise<void>
  test_result?(event: TestResultEvent): void | Promise<void>
  suite_end?(event: SuiteEndEvent): void | Promise<void>
  run_end?(event: RunEndEvent): void | Promise<void>
}

export type ReporterPreset = "progress" | "description"

export interface RunOptions {
  seed?: string
  reporters?: Array<Reporter | ReporterPreset>
  writer?: Writer
  color?: boolean | "auto"
  set_exit_code?: boolean
}

interface TestCase {
  name: string
  fn?: TestFunction
  focused: boolean
  skipped: boolean
}

interface Suite {
  name: string
  tests: TestCase[]
  before_hooks: HookFunction[]
  after_hooks: HookFunction[]
  around_hooks: AroundHookFunction[]
}

interface Context {
  suites: Suite[]
  current_suite?: Suite
  global_before_hooks: HookFunction[]
  global_after_hooks: HookFunction[]
  global_around_hooks: AroundHookFunction[]
  run_scheduled: boolean
  running: boolean
}

export interface ProgressReporterOptions {
  symbols?: Partial<Record<TestStatus, string>>
}

const default_symbols: Record<TestStatus, string> = {
  passed: ".",
  failed: "x",
  errored: "!",
  skipped: "s",
  pending: "p",
}

const stdout_writer: Writer = {
  write(text) {
    process.stdout.write(text)
  },
}

const context: Context = {
  suites: [],
  global_before_hooks: [],
  global_after_hooks: [],
  global_around_hooks: [],
  run_scheduled: false,
  running: false,
}

function colorize(text: string, color: "green" | "red" | "yellow" | "gray", enabled: boolean): string {
  if (!enabled) {
    return text
  }

  const codes = {
    green: 32,
    red: 31,
    yellow: 33,
    gray: 90,
  }

  return `\u001b[${codes[color]}m${text}\u001b[0m`
}

function should_use_color(option: boolean | "auto" | undefined): boolean {
  if (option === false || process.env.NO_COLOR !== undefined) {
    return false
  }

  if (option === true || process.env.FORCE_COLOR === "1") {
    return true
  }

  return process.stdout.isTTY === true
}

function full_test_name(suite_name: string, test_name: string): string {
  if (test_name.startsWith("#") || test_name.startsWith(".")) {
    return `${suite_name}${test_name}`
  }

  return `${suite_name} ${test_name}`
}

function hash_seed(seed: string): number {
  let hash = 2166136261

  for (const char of seed) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function random_from_seed(seed: string): () => number {
  let state = hash_seed(seed)

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items]
  const random = random_from_seed(seed)

  for (let index = result.length - 1; index > 0; index -= 1) {
    const other_index = Math.floor(random() * (index + 1))
    const item = result[index]
    const other = result[other_index]

    if (item !== undefined && other !== undefined) {
      result[index] = other
      result[other_index] = item
    }
  }

  return result
}

function make_seed(seed?: string): string {
  return seed ?? process.env.SEED ?? String(Date.now())
}

function is_assertion_failure(error: unknown): boolean {
  return error instanceof Error && error.name === "AssertionFailure"
}

function register_test(name: string, fn: TestFunction | undefined, focused: boolean, skipped: boolean): void {
  if (context.current_suite === undefined) {
    throw new Error("test must be declared inside a suite")
  }

  context.current_suite.tests.push({ name, fn, focused, skipped })
}

async function emit_run_start(reporters: Reporter[], event: RunStartEvent): Promise<void> {
  for (const reporter of reporters) {
    if (reporter.run_start !== undefined) {
      await reporter.run_start(event)
    }
  }
}

async function emit_suite_start(reporters: Reporter[], event: SuiteStartEvent): Promise<void> {
  for (const reporter of reporters) {
    if (reporter.suite_start !== undefined) {
      await reporter.suite_start(event)
    }
  }
}

async function emit_test_start(reporters: Reporter[], event: TestStartEvent): Promise<void> {
  for (const reporter of reporters) {
    if (reporter.test_start !== undefined) {
      await reporter.test_start(event)
    }
  }
}

async function emit_test_result(reporters: Reporter[], event: TestResultEvent): Promise<void> {
  for (const reporter of reporters) {
    if (reporter.test_result !== undefined) {
      await reporter.test_result(event)
    }
  }
}

async function emit_suite_end(reporters: Reporter[], event: SuiteEndEvent): Promise<void> {
  for (const reporter of reporters) {
    if (reporter.suite_end !== undefined) {
      await reporter.suite_end(event)
    }
  }
}

async function emit_run_end(reporters: Reporter[], event: RunEndEvent): Promise<void> {
  for (const reporter of reporters) {
    if (reporter.run_end !== undefined) {
      await reporter.run_end(event)
    }
  }
}

async function run_hooks(hooks: HookFunction[]): Promise<void> {
  for (const hook of hooks) {
    await hook()
  }
}

function wrap_around_hooks(hooks: AroundHookFunction[], fn: () => Promise<void>): () => Promise<void> {
  let wrapped = fn

  for (let index = hooks.length - 1; index >= 0; index -= 1) {
    const hook = hooks[index]
    const next = wrapped

    if (hook !== undefined) {
      wrapped = async () => {
      await hook(next)
      }
    }
  }

  return wrapped
}

function normalize_reporters(
  reporters: Array<Reporter | ReporterPreset> | undefined,
  writer: Writer,
  color: boolean,
): Reporter[] {
  if (reporters === undefined) {
    return [progress_reporter({}, writer, color), summary_reporter(writer)]
  }

  return reporters.flatMap((reporter) => {
    if (reporter === "progress") {
      return [progress_reporter({}, writer, color), summary_reporter(writer)]
    }

    if (reporter === "description") {
      return [description_reporter(writer), summary_reporter(writer)]
    }

    return [reporter]
  })
}

export function progress_reporter(
  options: ProgressReporterOptions = {},
  writer: Writer = stdout_writer,
  color = should_use_color("auto"),
): Reporter {
  const symbols = { ...default_symbols, ...options.symbols }

  return {
    async test_result(event) {
      const status = event.result.status
      const symbol = symbols[status]

      if (status === "passed") {
        await writer.write(colorize(symbol, "green", color))
      } else if (status === "failed" || status === "errored") {
        await writer.write(colorize(symbol, "red", color))
      } else {
        await writer.write(colorize(symbol, "yellow", color))
      }
    },
    async run_end() {
      await writer.write("\n")
    },
  }
}

export function summary_reporter(writer: Writer = stdout_writer): Reporter {
  return {
    async run_end(event) {
      const counts: Record<TestStatus, number> = {
        passed: 0,
        failed: 0,
        errored: 0,
        skipped: 0,
        pending: 0,
      }

      for (const test_result of event.result.tests) {
        counts[test_result.status] += 1
      }

      await writer.write(
        `seed ${event.result.seed} | ${counts.passed} passed, ${counts.failed} failed, ${counts.errored} errored, ${counts.skipped} skipped, ${counts.pending} pending\n`,
      )
    },
  }
}

export function description_reporter(writer: Writer = stdout_writer): Reporter {
  return {
    async suite_start(event) {
      await writer.write(`${event.suite_name}\n`)
    },
    async test_result(event) {
      await writer.write(`  ${event.result.status} ${event.result.test_name}\n`)
    },
  }
}

export function error_reporter(writer: Writer = stdout_writer): Reporter {
  return {
    async run_end(event) {
      for (const result of event.result.tests) {
        if (result.status === "failed" || result.status === "errored") {
          const message = result.error instanceof Error ? result.error.message : String(result.error)
          await writer.write(`${result.full_name}: ${message}\n`)
        }
      }
    },
  }
}

export function slow_test_reporter(writer: Writer = stdout_writer, limit = 5): Reporter {
  return {
    async run_end(event) {
      const slow_tests = [...event.result.tests]
        .filter((result) => result.status !== "skipped" && result.status !== "pending")
        .sort((left, right) => right.duration_ms - left.duration_ms)
        .slice(0, limit)

      if (slow_tests.length === 0) {
        return
      }

      await writer.write("slow tests\n")

      for (const result of slow_tests) {
        await writer.write(`${result.duration_ms}ms ${result.full_name}\n`)
      }
    },
  }
}

export function suite(name: string, fn: () => void): void {
  if (context.current_suite !== undefined) {
    throw new Error("nested suites are not allowed")
  }

  const next_suite: Suite = {
    name,
    tests: [],
    before_hooks: [],
    after_hooks: [],
    around_hooks: [],
  }

  context.current_suite = next_suite

  try {
    fn()
  } finally {
    context.current_suite = undefined
  }

  context.suites.push(next_suite)
  schedule_run()
}

export function before(fn: HookFunction): void {
  if (context.current_suite === undefined) {
    throw new Error("before must be declared inside a suite. Use Microtest.before for global hooks")
  }

  context.current_suite.before_hooks.push(fn)
}

export function after(fn: HookFunction): void {
  if (context.current_suite === undefined) {
    throw new Error("after must be declared inside a suite. Use Microtest.after for global hooks")
  }

  context.current_suite.after_hooks.push(fn)
}

export function around(fn: AroundHookFunction): void {
  if (context.current_suite === undefined) {
    throw new Error("around must be declared inside a suite. Use Microtest.around for global hooks")
  }

  context.current_suite.around_hooks.push(fn)
}

export function test(name: string, fn: TestFunction): void {
  register_test(name, fn, false, false)
}

test.only = (name: string, fn: TestFunction): void => {
  register_test(name, fn, true, false)
}

test.skip = (name: string, fn?: TestFunction): void => {
  register_test(name, fn, false, true)
}

export const Microtest = {
  before(fn: HookFunction): void {
    context.global_before_hooks.push(fn)
  },
  after(fn: HookFunction): void {
    context.global_after_hooks.push(fn)
  },
  around(fn: AroundHookFunction): void {
    context.global_around_hooks.push(fn)
  },
}

export async function run(options: RunOptions = {}): Promise<RunResult> {
  if (context.running) {
    throw new Error("microtest is already running")
  }

  context.running = true
  context.run_scheduled = true

  const started_at = Date.now()
  const seed = make_seed(options.seed)
  const writer = options.writer ?? stdout_writer
  const color = should_use_color(options.color)
  const reporters = normalize_reporters(options.reporters, writer, color)
  const has_focus = context.suites.some((next_suite) => next_suite.tests.some((next_test) => next_test.focused))
  const suite_results: SuiteResult[] = []
  const test_results: TestResult[] = []

  await emit_run_start(reporters, { seed })
  await run_hooks(context.global_before_hooks)

  for (const next_suite of context.suites) {
    const suite_started_at = Date.now()
    const suite_test_results: TestResult[] = []

    await emit_suite_start(reporters, { suite_name: next_suite.name })
    await run_hooks(next_suite.before_hooks)

    for (const next_test of shuffle(next_suite.tests, `${seed}:${next_suite.name}`)) {
      const full_name = full_test_name(next_suite.name, next_test.name)
      const test_started_at = Date.now()

      await emit_test_start(reporters, {
        suite_name: next_suite.name,
        test_name: next_test.name,
        full_name,
      })

      let status: TestStatus = "passed"
      let error: unknown

      if (next_test.skipped || (has_focus && !next_test.focused)) {
        status = "skipped"
      } else if (next_test.fn === undefined) {
        status = "pending"
      } else {
        try {
          const run_test = wrap_around_hooks(
            [...context.global_around_hooks, ...next_suite.around_hooks],
            async () => {
              if (next_test.fn !== undefined) {
                await next_test.fn()
              }
            },
          )

          await run_test()
        } catch (next_error) {
          error = next_error
          status = is_assertion_failure(next_error) ? "failed" : "errored"
        }
      }

      const result: TestResult = {
        suite_name: next_suite.name,
        test_name: next_test.name,
        full_name,
        status,
        duration_ms: Date.now() - test_started_at,
        error,
      }

      suite_test_results.push(result)
      test_results.push(result)
      await emit_test_result(reporters, { result })
    }

    await run_hooks(next_suite.after_hooks)

    const suite_result: SuiteResult = {
      name: next_suite.name,
      tests: suite_test_results,
      duration_ms: Date.now() - suite_started_at,
    }

    suite_results.push(suite_result)
    await emit_suite_end(reporters, { result: suite_result })
  }

  await run_hooks(context.global_after_hooks)

  const result: RunResult = {
    seed,
    status: test_results.some((test_result) => test_result.status === "failed" || test_result.status === "errored")
      ? "failed"
      : "passed",
    suites: suite_results,
    tests: test_results,
    duration_ms: Date.now() - started_at,
  }

  await emit_run_end(reporters, { result })

  if (result.status === "failed" && options.set_exit_code !== false) {
    process.exitCode = 1
  }

  context.running = false
  return result
}

function schedule_run(): void {
  if (context.run_scheduled) {
    return
  }

  context.run_scheduled = true

  setImmediate(() => {
    void run().catch((error: unknown) => {
      process.exitCode = 1
      console.error(error)
    })
  })
}
