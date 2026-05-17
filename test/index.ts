import {
  AssertionFailure,
  after,
  around,
  assert,
  before,
  Microtest,
  progress_reporter,
  suite,
  test,
  type Writer,
} from "../src/index.js"

class MemoryWriter implements Writer {
  output = ""

  write(text: string) {
    this.output += text
  }
}

Microtest.around(async (next) => {
  await next()
})

suite("assert", () => {
  test("#call passes for truthy values", () => {
    assert(true)
  })

  test("#call throws AssertionFailure for falsy values", () => {
    assert.throws(() => assert(false), AssertionFailure)
  })

  test(".equal compares values", () => {
    assert.equal(1, 1)
    assert.throws(() => assert.equal(1, 2), AssertionFailure)
  })

  test(".throws checks thrown errors", () => {
    assert.throws(() => {
      throw new Error("boom")
    }, "boom")
  })
})

suite("hooks", () => {
  const events: string[] = []

  before(() => {
    events.push("before")
  })

  around(async (next) => {
    events.push("around before")
    await next()
    events.push("around after")
  })

  after(() => {
    assert.equal(events.join(","), "before,around before,test,around after")
  })

  test("#order", () => {
    events.push("test")
  })
})

suite("reporters", () => {
  test("#progress_reporter uses configurable symbols", async () => {
    const writer = new MemoryWriter()
    const reporter = progress_reporter({ symbols: { passed: "P" } }, writer, false)

    await reporter.test_result?.({
      result: {
        suite_name: "Thing",
        test_name: "#works",
        full_name: "Thing#works",
        status: "passed",
        duration_ms: 0,
      },
    })

    assert.equal(writer.output, "P")
  })
})
