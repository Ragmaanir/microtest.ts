import { GREEN, RED, type RGB, YELLOW } from "../color.js"
import { TestStatus } from "../results.js"
import type { Writer } from "../writer.js"
import { Reporter } from "./reporter.js"
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
  static readonly DEFAULT_TEST_STATUS_COLORS: Record<TestStatus, RGB> = {
    [TestStatus.Passed]: GREEN,
    [TestStatus.Failed]: RED,
    [TestStatus.Errored]: RED,
    [TestStatus.Skipped]: YELLOW,
    [TestStatus.Pending]: YELLOW,
  }

  protected constructor(protected readonly writer: Writer = STDOUT_WRITER) {
    super()
  }

  protected async write(text: string, color?: RGB): Promise<void> {
    await this.writer.write(text, color)
  }

  protected async writeln(text = "", color?: RGB): Promise<void> {
    await this.writer.writeln(text, color)
  }
}
