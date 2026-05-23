import path from "node:path"

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

  call(backtrace: readonly string[], highlight?: string): string {
    const entries = this.simplify(backtrace)
    const lines = entries.map((entry) => this.format_entry(entry, highlight))

    return this.grouped_lines(lines)
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

  private format_entry(entry: BacktraceEntry, highlight?: string): string {
    const func = highlight !== undefined && entry.func.includes(highlight) ? `**${entry.func}**` : entry.func

    return `${entry.path}:${entry.line} ${func}`
  }

  private grouped_lines(lines: readonly string[]): string {
    if (lines.length === 0) {
      return ""
    }

    return `${lines
      .map((line, index) => {
        if (index === 0) {
          return `┏ ${line}`
        }

        if (index === lines.length - 1) {
          return `┗ ${line}`
        }

        return `┃ ${line}`
      })
      .join("\n")}\n`
  }
}
