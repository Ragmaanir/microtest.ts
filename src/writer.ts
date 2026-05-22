import type { RGB } from "./color.js"

export interface Writer {
  write(text: string, color?: RGB): void | Promise<void>
  writeln(text?: string, color?: RGB): void | Promise<void>
}
