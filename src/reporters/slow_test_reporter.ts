import type { RunEndEvent } from "../events.js"
import { TestStatus } from "../results.js"
import type { Writer } from "./reporter.js"
import { STDOUT_WRITER } from "./stdout_writer.js"
import { TerminalReporter } from "./terminal_reporter.js"

export class SlowTestReporter extends TerminalReporter {
  constructor(
    writer: Writer = STDOUT_WRITER,
    use_colors?: boolean,
    private readonly limit = 5,
  ) {
    super(writer, use_colors)
  }

  async run_end(event: RunEndEvent): Promise<void> {
    const slow_tests = [...event.result.tests]
      .filter((result) => result.status !== TestStatus.Skipped && result.status !== TestStatus.Pending)
      .sort((left, right) => right.duration_ms - left.duration_ms)
      .slice(0, this.limit)

    if (slow_tests.length === 0) {
      return
    }

    await this.writeln("slow tests")

    for (const result of slow_tests) {
      await this.writeln(`${result.duration_ms}ms ${result.full_name}`)
    }
  }
}
