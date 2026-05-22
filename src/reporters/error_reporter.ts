import type { RunEndEvent } from "../events.js"
import { TestStatus } from "../results.js"
import type { Writer } from "../writer.js"
import { STDOUT_WRITER } from "./stdout_writer.js"
import { TerminalReporter } from "./terminal_reporter.js"

export class ErrorReporter extends TerminalReporter {
  constructor(writer: Writer = STDOUT_WRITER) {
    super(writer)
  }

  async run_end(event: RunEndEvent): Promise<void> {
    for (const result of event.result.tests) {
      if (result.status === TestStatus.Failed || result.status === TestStatus.Errored) {
        const message = result.error instanceof Error ? result.error.message : String(result.error)
        await this.writeln(`${result.full_name}: ${message}`)
      }
    }
  }
}
