import { assert, suite, test } from "../../../src/index.js"

function assertion_helper() {
  assert(false)
}

suite("AssertionFailureFixture", () => {
  test("#fails", () => {
    assertion_helper()
  })
})
