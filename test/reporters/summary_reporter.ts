import { assert, SummaryReporter, suite, test } from "../../src/index.js"
import { MemoryWriter, run_result } from "./helpers.js"

suite("SummaryReporter", () => {
  test("#run_end writes counts for passed, failed, errored, and skipped results", async () => {
    const writer = new MemoryWriter()
    const reporter = new SummaryReporter(writer, false)

    await reporter.run_end({ result: run_result() })

    assert.equal(writer.output, "seed reporter-seed | 1 passed, 1 failed, 1 errored, 1 skipped, 0 pending\n")
  })
})
