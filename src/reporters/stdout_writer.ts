import type { RGB } from "../color.js"
import type { Writer } from "../writer.js"

export class StdoutWriter implements Writer {
  static default(use_colors: boolean | undefined): Writer {
    return use_colors === undefined ? STDOUT_WRITER : new StdoutWriter(use_colors)
  }

  constructor(private readonly use_colors = process.env.COLOR !== "0") {}

  write(text: string, color?: RGB): void {
    const output = color?.colorize(text, this.use_colors) ?? text
    process.stdout.write(output)
  }

  writeln(text = "", color?: RGB): void {
    this.write(`${text}\n`, color)
  }
}

export const STDOUT_WRITER = new StdoutWriter()
