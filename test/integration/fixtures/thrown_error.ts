import { suite, test } from "../../../src/index.js"

function error_helper() {
  throw new Error("boom")
}

suite("ErrorFixture", () => {
  test("#errors", () => {
    error_helper()
  })
})
