import type { RGB } from "../color.js"
import { TestStatus } from "../results.js"
import { Reporter, type Writer } from "./reporter.js"
import { STDOUT_WRITER } from "./stdout_writer.js"

export type ResultSymbols = Record<TestStatus, string>

const DOT = "•"
const TICK = "✓"
const CROSS = "✕"
const BANG = "💥"

export const DOTS: ResultSymbols = {
  [TestStatus.Passed]: DOT,
  [TestStatus.Failed]: DOT,
  [TestStatus.Errored]: BANG,
  [TestStatus.Skipped]: DOT,
  [TestStatus.Pending]: DOT,
}

export const TICKS: ResultSymbols = {
  [TestStatus.Passed]: TICK,
  [TestStatus.Failed]: CROSS,
  [TestStatus.Errored]: BANG,
  [TestStatus.Skipped]: TICK,
  [TestStatus.Pending]: TICK,
}

export abstract class TerminalReporter extends Reporter {
  protected constructor(
    protected readonly writer: Writer = STDOUT_WRITER,
    use_colors?: boolean,
  ) {
    super()
    this.use_colors = use_colors !== false && process.env.COLOR !== "0"
  }

  protected readonly use_colors: boolean

  protected async write(text: string, color?: RGB): Promise<void> {
    await this.writer.write(color?.colorize(text, this.use_colors) ?? text)
  }

  protected async writeln(text = "", color?: RGB): Promise<void> {
    await this.writer.writeln(color?.colorize(text, this.use_colors) ?? text)
  }
}
