import path from "node:path"
import { CYAN, DARK_GRAY, LIGHT_MAGENTA, MAGENTA, type RGB, YELLOW } from "./color.js"
import { STDOUT_WRITER } from "./reporters.js"
import type { Writer } from "./writer.js"

export enum BacktraceKind {
  App = "app",
  Test = "test",
  Lib = "lib",
  Node = "node",
  Eval = "eval",
  Unknown = "unknown",
}

export class BacktraceEntry {
  constructor(
    readonly kind: BacktraceKind,
    readonly path: string,
    readonly line: number,
    readonly func: string,
  ) {}
}

export class BacktracePrinter {
  static readonly PROJECT_DIR = process.cwd()
  static readonly PROJECT_SRC_DIR = path.join(BacktracePrinter.PROJECT_DIR, "src")
  static readonly PROJECT_TEST_DIR = path.join(BacktracePrinter.PROJECT_DIR, "test")
  static readonly PROJECT_NODE_MODULES_DIR = path.join(BacktracePrinter.PROJECT_DIR, "node_modules")
  static readonly NODE_INTERNAL_PREFIX = "node:"
  static readonly BACKTRACE_KIND_COLORS: Record<BacktraceKind, RGB> = {
    [BacktraceKind.App]: LIGHT_MAGENTA,
    [BacktraceKind.Test]: LIGHT_MAGENTA,
    [BacktraceKind.Lib]: MAGENTA,
    [BacktraceKind.Node]: DARK_GRAY,
    [BacktraceKind.Eval]: DARK_GRAY,
    [BacktraceKind.Unknown]: CYAN,
  }

  constructor(private readonly writer: Writer = STDOUT_WRITER) {}

  static classify_path(file_path: string): BacktraceKind {
    if (file_path.startsWith(BacktracePrinter.PROJECT_SRC_DIR)) {
      return BacktraceKind.App
    }

    if (file_path.startsWith(BacktracePrinter.PROJECT_TEST_DIR)) {
      return BacktraceKind.Test
    }

    if (file_path.startsWith(BacktracePrinter.PROJECT_NODE_MODULES_DIR)) {
      return BacktraceKind.Lib
    }

    if (file_path.startsWith(BacktracePrinter.NODE_INTERNAL_PREFIX)) {
      return BacktraceKind.Node
    }

    if (file_path.startsWith("eval")) {
      return BacktraceKind.Eval
    }

    return BacktraceKind.Unknown
  }

  static simplify_path(file_path: string): [BacktraceKind, string] {
    const kind = BacktracePrinter.classify_path(file_path)

    switch (kind) {
      case BacktraceKind.App:
        return [kind, file_path.replace(BacktracePrinter.PROJECT_SRC_DIR, "APP: src")]
      case BacktraceKind.Test:
        return [kind, file_path.replace(BacktracePrinter.PROJECT_TEST_DIR, "TEST: test")]
      case BacktraceKind.Lib:
        return [kind, file_path.replace(BacktracePrinter.PROJECT_NODE_MODULES_DIR, "LIB: node_modules")]
      case BacktraceKind.Node:
        return [kind, `NODE: ${file_path}`]
      case BacktraceKind.Eval:
        return [kind, `EVAL: ${file_path}`]
      case BacktraceKind.Unknown:
        return [kind, `???: ${file_path}`]
    }
  }

  async call(backtrace: readonly string[], highlight?: string): Promise<void> {
    const entries = this.simplify(backtrace)

    await this.write_grouped_entries(entries, highlight)
  }

  simplify(backtrace: readonly string[]): BacktraceEntry[] {
    const entries: BacktraceEntry[] = []

    for (const line of backtrace) {
      const parsed = this.parse_line(line)

      if (parsed !== null) {
        const [kind, simple_path] = BacktracePrinter.simplify_path(parsed.file)

        entries.push(new BacktraceEntry(kind, simple_path, parsed.line, parsed.func))
      }
    }

    return entries.reverse()
  }

  private parse_line(line: string): { file: string; line: number; func: string } | null {
    const trimmed = line.trim()
    const match = /^at (?:(?<func>.*?) \()?(?<file>.+):(?<line>\d+):(?<column>\d+)\)?$/.exec(trimmed)

    if (match?.groups === undefined) {
      return null
    }

    return {
      file: this.clean_file(match.groups.file!),
      line: Number(match.groups.line),
      func: match.groups.func ?? "anonymous",
    }
  }

  private clean_file(file: string): string {
    if (file.startsWith("file:///")) {
      return file.slice("file:///".length)
    }

    return file
  }

  private async write_grouped_entries(entries: readonly BacktraceEntry[], highlight?: string): Promise<void> {
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index]!
      const marker = this.line_marker(index, entries.length)

      await this.writer.write(`${marker} `, DARK_GRAY)
      await this.writer.write(entry.path, BacktracePrinter.BACKTRACE_KIND_COLORS[entry.kind])
      await this.writer.write(`:${entry.line} `, DARK_GRAY)
      await this.writer.writeln(entry.func, this.func_color(entry, highlight))
    }
  }

  private line_marker(index: number, length: number): string {
    if (index === 0) {
      return "┏"
    }

    if (index === length - 1) {
      return "┗"
    }

    return "┃"
  }

  private func_color(entry: BacktraceEntry, highlight?: string): RGB {
    if (highlight !== undefined && entry.func.includes(highlight)) {
      return YELLOW
    }

    if (entry.kind === BacktraceKind.App || entry.kind === BacktraceKind.Test) {
      return YELLOW
    }

    return DARK_GRAY
  }
}
