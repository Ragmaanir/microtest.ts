import { assert, ErrorReporter, suite, test } from "../../src/index.js"
import { MemoryWriter, run_result } from "./helpers.js"

suite("ErrorReporter", () => {
  test("#run_end writes failed and errored results only", async () => {
    const writer = new MemoryWriter()
    const reporter = new ErrorReporter(writer)

    await reporter.run_end({ result: run_result() })

    assert.equal(writer.output, "Reporter#fails: failed\nReporter#errors: errored\n")
  })
})
