import { assert, suite, test } from "../../src/index.js"
import { run_fixture } from "./helpers.js"

suite("failing test integration", () => {
  test("#assertion_failure exits non-zero and prints stack", () => {
    const result = run_fixture("test/integration/fixtures/assertion_failure.ts")

    assert.equal(result.status, 1)
    assert(result.output.includes("AssertionFailureFixture#fails"))
    assert(result.output.includes("AssertionFailure: assertion failed"))
    assert(result.output.includes("assertion_helper"))
  })

  test("#thrown_error exits non-zero and prints stack", () => {
    const result = run_fixture("test/integration/fixtures/thrown_error.ts")

    assert.equal(result.status, 1)
    assert(result.output.includes("ErrorFixture#errors"))
    assert(result.output.includes("Error: boom"))
    assert(result.output.includes("error_helper"))
  })

  test("#nested_stack includes nested helper frames", () => {
    const result = run_fixture("test/integration/fixtures/nested_stack.ts")

    assert.equal(result.status, 1)
    assert(result.output.includes("NestedStackFixture#shows_nested_stack"))
    assert(result.output.includes("AssertionFailure: expected \"left\" to equal \"right\""))
    assert(result.output.includes("leaf"))
    assert(result.output.includes("middle"))
    assert(result.output.includes("root"))
  })
})
