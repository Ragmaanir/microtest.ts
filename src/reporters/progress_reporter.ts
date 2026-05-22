import { GREEN, RED, YELLOW } from "../color.js"
import type { TestResultEvent } from "../events.js"
import { TestStatus } from "../results.js"
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

    if (status === TestStatus.Passed) {
      await this.write(symbol, GREEN)
    } else if (status === TestStatus.Failed || status === TestStatus.Errored) {
      await this.write(symbol, RED)
    } else {
      await this.write(symbol, YELLOW)
    }
  }

  async run_end(): Promise<void> {
    await this.writeln()
  }
}
