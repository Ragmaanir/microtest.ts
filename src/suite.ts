import type { TestCase } from "./test_case.js"

export type HookFunction = () => void | Promise<void>
export type AroundHookFunction = (next: () => Promise<void>) => void | Promise<void>

export class Suite {
  readonly tests: TestCase[] = []
  readonly before_hooks: HookFunction[] = []
  readonly after_hooks: HookFunction[] = []
  readonly around_hooks: AroundHookFunction[] = []

  constructor(readonly name: string) {}

  add_test(test_case: TestCase): void {
    this.tests.push(test_case)
  }

  before(fn: HookFunction): void {
    this.before_hooks.push(fn)
  }

  after(fn: HookFunction): void {
    this.after_hooks.push(fn)
  }

  around(fn: AroundHookFunction): void {
    this.around_hooks.push(fn)
  }
}
