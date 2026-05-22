import { assert, DescriptionReporter, suite, TestStatus, TICKS, test } from "../../src/index.js"
import { all_results, MemoryWriter } from "./helpers.js"

suite("DescriptionReporter", () => {
  test("#test_result writes symbols for passed, failed, errored, and skipped results", async () => {
    const writer = new MemoryWriter()
    const reporter = new DescriptionReporter({ symbols: TICKS }, writer)

    await reporter.suite_start({ suite_name: "Reporter" })

    for (const result of all_results) {
      await reporter.test_result({ result })
    }

    assert.equal(
      writer.output,
      [
        "Reporter",
        `  ${TICKS[TestStatus.Passed]} #passes`,
        `  ${TICKS[TestStatus.Failed]} #fails`,
        `  ${TICKS[TestStatus.Errored]} #errors`,
        `  ${TICKS[TestStatus.Skipped]} #skips`,
        "",
      ].join("\n"),
    )
  })
})
