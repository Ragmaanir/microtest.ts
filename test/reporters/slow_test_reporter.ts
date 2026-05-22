import { assert, SlowTestReporter, suite, test } from "../../src/index.js"
import { MemoryWriter, run_result } from "./helpers.js"

suite("SlowTestReporter", () => {
  test("#run_end writes non-skipped results ordered by duration", async () => {
    const writer = new MemoryWriter()
    const reporter = new SlowTestReporter(writer, false, 5)

    await reporter.run_end({ result: run_result() })

    assert.equal(
      writer.output,
      ["slow tests", "30ms Reporter#errors", "20ms Reporter#fails", "10ms Reporter#passes", ""].join("\n"),
    )
  })
})
