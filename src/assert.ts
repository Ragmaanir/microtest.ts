export class AssertionFailure extends Error {
  override readonly name = "AssertionFailure"
}

export type ErrorClass = new (...args: never[]) => Error

function format_value(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value)
  }

  return String(value)
}

function matches_error(error: unknown, expected: RegExp | string | ErrorClass): boolean {
  if (typeof expected === "string") {
    return error instanceof Error && error.message.includes(expected)
  }

  if (expected instanceof RegExp) {
    return error instanceof Error && expected.test(error.message)
  }

  return error instanceof expected
}

export function assert(condition: unknown): asserts condition {
  if (!condition) {
    throw new AssertionFailure("assertion failed")
  }
}

export namespace assert {
  export function equal<T>(actual: T, expected: T): void {
    if (!Object.is(actual, expected)) {
      throw new AssertionFailure(`expected ${format_value(actual)} to equal ${format_value(expected)}`)
    }
  }

  export function throws(fn: () => unknown, expected?: RegExp | string | ErrorClass): void {
    try {
      fn()
    } catch (error) {
      if (expected === undefined || matches_error(error, expected)) {
        return
      }

      throw new AssertionFailure("thrown error did not match expectation")
    }

    throw new AssertionFailure("expected function to throw")
  }
}
