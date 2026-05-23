import { assert, suite, test } from "../../../src/index.js"

function leaf() {
  assert.equal("left", "right")
}

function middle() {
  leaf()
}

function root() {
  middle()
}

suite("NestedStackFixture", () => {
  test("#shows_nested_stack", () => {
    root()
  })
})
