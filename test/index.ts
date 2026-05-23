import {
  AssertionFailure,
  after,
  around,
  assert,
  before,
  DOTS,
  Microtest,
  ProgressReporter,
  suite,
  TestStatus,
  test,
  type Writer,
} from "../src/index.js"
import "./integration/failing_tests.js"
import "./reporters/description_reporter.js"
import "./reporters/error_reporter.js"
import "./reporters/progress_reporter.js"
import "./reporters/slow_test_reporter.js"
import "./reporters/summary_reporter.js"

class MemoryWriter implements Writer {
  output = ""

  write(text: string) {
    this.output += text
  }

  writeln(text = "") {
    this.output += `${text}\n`
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
    const reporter = new ProgressReporter({ symbols: { ...DOTS, [TestStatus.Passed]: "P" } }, writer)

    await reporter.test_result?.({
      result: {
        suite_name: "Thing",
        test_name: "#works",
        full_name: "Thing#works",
        status: TestStatus.Passed,
        duration_ms: 0,
      },
    })

    assert.equal(writer.output, "P")
  })
})
