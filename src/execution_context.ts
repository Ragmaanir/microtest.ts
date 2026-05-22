import { Rand } from "./rand.js"
import {
  ProgressReporter,
  type Reporter,
  StdoutWriter,
  SummaryReporter,
  type Writer,
} from "./reporters.js"
import { RunResult, SuiteResult, TestResult, TestStatus } from "./results.js"
import { type AroundHookFunction, type HookFunction, Suite } from "./suite.js"
import { TestCase, type TestFunction } from "./test_case.js"

export interface RunOptions {
  seed?: string
  reporters?: Reporter[]
  writer?: Writer
  use_colors?: boolean
  set_exit_code?: boolean
}

export class ExecutionContext {
  readonly suites: Suite[] = []
  readonly global_before_hooks: HookFunction[] = []
  readonly global_after_hooks: HookFunction[] = []
  readonly global_around_hooks: AroundHookFunction[] = []

  current_suite: Suite | null = null
  run_scheduled = false
  running = false

  suite(name: string, fn: () => void): void {
    if (this.current_suite !== null) {
      throw new Error("nested suites are not allowed")
    }

    const next_suite = new Suite(name)
    this.current_suite = next_suite

    try {
      fn()
    } finally {
      this.current_suite = null
    }

    this.suites.push(next_suite)
    this.schedule_run()
  }

  before(fn: HookFunction): void {
    this.require_current_suite("before", "Microtest.before").before(fn)
  }

  after(fn: HookFunction): void {
    this.require_current_suite("after", "Microtest.after").after(fn)
  }

  around(fn: AroundHookFunction): void {
    this.require_current_suite("around", "Microtest.around").around(fn)
  }

  test(name: string, fn: TestFunction | undefined, focused: boolean, skipped: boolean): void {
    this.require_current_suite("test", "suite").add_test(new TestCase(name, fn, focused, skipped))
  }

  global_before(fn: HookFunction): void {
    this.global_before_hooks.push(fn)
  }

  global_after(fn: HookFunction): void {
    this.global_after_hooks.push(fn)
  }

  global_around(fn: AroundHookFunction): void {
    this.global_around_hooks.push(fn)
  }

  async run(options: RunOptions = {}): Promise<RunResult> {
    if (this.running) {
      throw new Error("microtest is already running")
    }

    this.running = true
    this.run_scheduled = true

    try {
      return await this.run_suites(options)
    } finally {
      this.running = false
    }
  }

  private require_current_suite(action: string, global_action: string): Suite {
    if (this.current_suite === null) {
      throw new Error(`${action} must be declared inside a suite. Use ${global_action} for global hooks`)
    }

    return this.current_suite
  }

  private schedule_run(): void {
    if (this.run_scheduled) {
      return
    }

    this.run_scheduled = true

    setImmediate(() => {
      void this.run().catch((error: unknown) => {
        process.exitCode = 1
        console.error(error)
      })
    })
  }

  private make_seed(seed?: string): string {
    return seed ?? process.env.SEED ?? String(Date.now())
  }

  private is_assertion_failure(error: unknown): boolean {
    return error instanceof Error && error.name === "AssertionFailure"
  }

  private async run_hooks(hooks: HookFunction[]): Promise<void> {
    for (const hook of hooks) {
      await hook()
    }
  }

  private wrap_around_hooks(hooks: AroundHookFunction[], fn: () => Promise<void>): () => Promise<void> {
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

  private normalize_reporters(
    reporters: Reporter[] | undefined,
    writer: Writer,
  ): Reporter[] {
    if (reporters === undefined) {
      return [new ProgressReporter({}, writer), new SummaryReporter(writer)]
    }

    return reporters
  }

  private run_status_from_tests(test_results: TestResult[]): RunResult["status"] {
    return test_results.some(
      (test_result) => test_result.status === TestStatus.Failed || test_result.status === TestStatus.Errored,
    )
      ? "failed"
      : "passed"
  }

  private full_test_name(suite_name: string, test_name: string): string {
    if (test_name.startsWith("#") || test_name.startsWith(".")) {
      return `${suite_name}${test_name}`
    }

    return `${suite_name} ${test_name}`
  }

  private async run_suites(options: RunOptions): Promise<RunResult> {
    const started_at = Date.now()
    const seed = this.make_seed(options.seed)
    const rand = new Rand(seed)
    const writer = options.writer ?? StdoutWriter.default(options.use_colors)
    const reporters = this.normalize_reporters(options.reporters, writer)
    const has_focus = this.suites.some((next_suite) => next_suite.tests.some((next_test) => next_test.focused))
    const suite_results: SuiteResult[] = []
    const test_results: TestResult[] = []

    for (const reporter of reporters) {
      await reporter.run_start?.({ seed })
    }

    await this.run_hooks(this.global_before_hooks)

    for (const next_suite of this.suites) {
      const suite_result = await this.run_suite(next_suite, reporters, has_focus, rand)

      suite_results.push(suite_result)
      test_results.push(...suite_result.tests)
    }

    await this.run_hooks(this.global_after_hooks)

    const result = new RunResult(
      seed,
      this.run_status_from_tests(test_results),
      suite_results,
      test_results,
      Date.now() - started_at,
    )

    for (const reporter of reporters) {
      await reporter.run_end?.({ result })
    }

    if (result.status === "failed" && options.set_exit_code !== false) {
      process.exitCode = 1
    }

    return result
  }

  private async run_suite(
    next_suite: Suite,
    reporters: Reporter[],
    has_focus: boolean,
    rand: Rand,
  ): Promise<SuiteResult> {
    const suite_started_at = Date.now()
    const suite_test_results: TestResult[] = []

    for (const reporter of reporters) {
      await reporter.suite_start?.({ suite_name: next_suite.name })
    }

    await this.run_hooks(next_suite.before_hooks)

    for (const next_test of rand.shuffle(next_suite.tests)) {
      const result = await this.run_test(next_suite, next_test, reporters, has_focus)

      suite_test_results.push(result)

      for (const reporter of reporters) {
        await reporter.test_result?.({ result })
      }
    }

    await this.run_hooks(next_suite.after_hooks)

    const result = new SuiteResult(next_suite.name, suite_test_results, Date.now() - suite_started_at)

    for (const reporter of reporters) {
      await reporter.suite_end?.({ result })
    }

    return result
  }

  private async run_test(
    next_suite: Suite,
    next_test: TestCase,
    reporters: Reporter[],
    has_focus: boolean,
  ): Promise<TestResult> {
    const full_name = this.full_test_name(next_suite.name, next_test.name)
    const test_started_at = Date.now()

    for (const reporter of reporters) {
      await reporter.test_start?.({
        suite_name: next_suite.name,
        test_name: next_test.name,
        full_name,
      })
    }

    let status = TestStatus.Passed
    let error: unknown

    if (next_test.skipped || (has_focus && !next_test.focused)) {
      status = TestStatus.Skipped
    } else if (next_test.fn === undefined) {
      status = TestStatus.Pending
    } else {
      try {
        const run_test = this.wrap_around_hooks(
          [...this.global_around_hooks, ...next_suite.around_hooks],
          async () => {
            if (next_test.fn !== undefined) {
              await next_test.fn()
            }
          },
        )

        await run_test()
      } catch (next_error) {
        error = next_error
        status = this.is_assertion_failure(next_error) ? TestStatus.Failed : TestStatus.Errored
      }
    }

    return new TestResult(
      next_suite.name,
      next_test.name,
      full_name,
      status,
      Date.now() - test_started_at,
      error,
    )
  }
}
