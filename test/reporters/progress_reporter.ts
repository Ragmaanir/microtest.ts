import { assert, DOTS, ProgressReporter, suite, TestStatus, test } from "../../src/index.js"
import { all_results, MemoryWriter } from "./helpers.js"

suite("ProgressReporter", () => {
  test("#test_result writes symbols for passed, failed, errored, and skipped results", async () => {
    const writer = new MemoryWriter()
    const reporter = new ProgressReporter({ symbols: DOTS }, writer)

    for (const result of all_results) {
      await reporter.test_result({ result })
    }

    await reporter.run_end()

    assert.equal(
      writer.output,
      `${DOTS[TestStatus.Passed]}${DOTS[TestStatus.Failed]}${DOTS[TestStatus.Errored]}${DOTS[TestStatus.Skipped]}\n`,
    )
  })

  test("#test_result uses configurable symbols", async () => {
    const writer = new MemoryWriter()
    const reporter = new ProgressReporter({ symbols: { ...DOTS, [TestStatus.Passed]: "P" } }, writer)

    await reporter.test_result({
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
