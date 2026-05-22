import type { TestResultEvent } from "../events.js"
import type { Writer } from "../writer.js"
import { STDOUT_WRITER } from "./stdout_writer.js"
import { DOTS, type ResultSymbols, TerminalReporter } from "./terminal_reporter.js"

export class ProgressReporter extends TerminalReporter {
  private readonly symbols: ResultSymbols

  constructor(
    options: { symbols?: ResultSymbols } = {},
    writer: Writer = STDOUT_WRITER,
  ) {
    super(writer)
    this.symbols = options.symbols ?? DOTS
  }

  async test_result(event: TestResultEvent): Promise<void> {
    const status = event.result.status
    const symbol = this.symbols[status]

    await this.write(symbol, TerminalReporter.DEFAULT_TEST_STATUS_COLORS[status])
  }

  async run_end(): Promise<void> {
    await this.writeln()
  }
}
