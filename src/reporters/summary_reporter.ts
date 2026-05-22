import type { RunEndEvent } from "../events.js"
import { TestStatus } from "../results.js"
import type { Writer } from "./reporter.js"
import { STDOUT_WRITER } from "./stdout_writer.js"
import { TerminalReporter } from "./terminal_reporter.js"

export class SummaryReporter extends TerminalReporter {
  constructor(writer: Writer = STDOUT_WRITER, use_colors?: boolean) {
    super(writer, use_colors)
  }

  async run_end(event: RunEndEvent): Promise<void> {
    const counts: Record<TestStatus, number> = {
      [TestStatus.Passed]: 0,
      [TestStatus.Failed]: 0,
      [TestStatus.Errored]: 0,
      [TestStatus.Skipped]: 0,
      [TestStatus.Pending]: 0,
    }

    for (const test_result of event.result.tests) {
      counts[test_result.status] += 1
    }

    await this.writeln(
      `seed ${event.result.seed} | ${counts.passed} passed, ${counts.failed} failed, ${counts.errored} errored, ${counts.skipped} skipped, ${counts.pending} pending`,
    )
  }
}
