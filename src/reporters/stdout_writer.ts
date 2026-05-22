import type { Writer } from "./reporter.js"

export const STDOUT_WRITER: Writer = {
  write(text) {
    process.stdout.write(text)
  },
  writeln(text = "") {
    process.stdout.write(`${text}\n`)
  },
}
