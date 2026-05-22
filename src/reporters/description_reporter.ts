import { GREEN, RED, type RGB, YELLOW } from "../color.js"
import type { SuiteStartEvent, TestResultEvent } from "../events.js"
import { TestStatus } from "../results.js"
import type { Writer } from "./reporter.js"
import { STDOUT_WRITER } from "./stdout_writer.js"
import { type ResultSymbols, TerminalReporter, TICKS } from "./terminal_reporter.js"

export class DescriptionReporter extends TerminalReporter {
  private readonly symbols: ResultSymbols

  constructor(
    options: { symbols?: ResultSymbols; use_colors?: boolean } = {},
    writer: Writer = STDOUT_WRITER,
  ) {
    super(writer, options.use_colors)
    this.symbols = options.symbols ?? TICKS
  }

  async suite_start(event: SuiteStartEvent): Promise<void> {
    await this.writeln(event.suite_name)
  }

  async test_result(event: TestResultEvent): Promise<void> {
    const symbol = this.symbols[event.result.status]
    const color = this.result_color(event.result.status)

    await this.write("  ")
    await this.write(symbol, color)
    await this.writeln(` ${event.result.test_name}`)
  }

  private result_color(status: TestStatus): RGB {
    switch (status) {
      case TestStatus.Passed:
        return GREEN
      case TestStatus.Failed:
      case TestStatus.Errored:
        return RED
      case TestStatus.Pending:
      case TestStatus.Skipped:
        return YELLOW
    }
  }
}
