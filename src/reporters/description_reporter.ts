import type { SuiteStartEvent, TestResultEvent } from "../events.js"
import type { Writer } from "../writer.js"
import { STDOUT_WRITER } from "./stdout_writer.js"
import { type ResultSymbols, TerminalReporter, TICKS } from "./terminal_reporter.js"

export class DescriptionReporter extends TerminalReporter {
  private readonly symbols: ResultSymbols

  constructor(
    options: { symbols?: ResultSymbols } = {},
    writer: Writer = STDOUT_WRITER,
  ) {
    super(writer)
    this.symbols = options.symbols ?? TICKS
  }

  async suite_start(event: SuiteStartEvent): Promise<void> {
    await this.writeln(event.suite_name)
  }

  async test_result(event: TestResultEvent): Promise<void> {
    const symbol = this.symbols[event.result.status]
    const color = TerminalReporter.DEFAULT_TEST_STATUS_COLORS[event.result.status]

    await this.write("  ")
    await this.write(symbol, color)
    await this.writeln(` ${event.result.test_name}`)
  }

}
