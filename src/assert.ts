import { isDeepStrictEqual } from "node:util"

export class AssertionFailure extends Error {
  override readonly name = "AssertionFailure"
}

export type ErrorClass = new (...args: never[]) => Error
export type InstanceClass<T = unknown> = new (...args: never[]) => T

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
    if (!isDeepStrictEqual(actual, expected)) {
      fail(`expected ${format_value(actual)} to equal ${format_value(expected)}`)
    }
  }

  export function fail(message: string): never {
    throw new AssertionFailure(message)
  }

  export function instance<T>(value: unknown, expected: InstanceClass<T>): asserts value is T {
    if (!(value instanceof expected)) {
      fail(`expected ${format_value(value)} to be an instance of ${expected.name}`)
    }
  }

  export function is(actual: unknown, expected: unknown): void {
    if (!Object.is(actual, expected)) {
      fail(`expected ${format_value(actual)} to be ${format_value(expected)}`)
    }
  }

  export function ok(value: unknown): asserts value {
    assert(value)
  }

  export function throws(fn: () => unknown, expected?: RegExp | string | ErrorClass): void {
    try {
      fn()
    } catch (error) {
      if (expected === undefined || matches_error(error, expected)) {
        return
      }

      fail("thrown error did not match expectation")
    }

    fail("expected function to throw")
  }

  export function unreachable(): never {
    fail("unreachable")
  }
}
