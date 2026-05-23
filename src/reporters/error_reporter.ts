import { BacktracePrinter } from "../backtrace_printer.js"
import type { RunEndEvent } from "../events.js"
import { TestStatus } from "../results.js"
import type { Writer } from "../writer.js"
import { STDOUT_WRITER } from "./stdout_writer.js"
import { TerminalReporter } from "./terminal_reporter.js"

export class ErrorReporter extends TerminalReporter {
  private readonly backtrace_printer = new BacktracePrinter()

  constructor(writer: Writer = STDOUT_WRITER) {
    super(writer)
  }

  async run_end(event: RunEndEvent): Promise<void> {
    for (const result of event.result.tests) {
      if (result.status === TestStatus.Failed || result.status === TestStatus.Errored) {
        await this.writeln(`${result.full_name}: ${this.error_message(result.error)}`)
      }
    }
  }

  private error_message(error: unknown): string {
    if (!(error instanceof Error)) {
      return String(error)
    }

    if (error.stack === undefined) {
      return error.message
    }

    const [message, ...backtrace] = error.stack.split("\n")

    return `${message}\n${this.backtrace_printer.call(backtrace)}`
  }
}
