import path from "node:path"
import { assert, BacktraceKind, BacktracePrinter, suite, test, type Writer } from "../src/index.js"

class MemoryWriter implements Writer {
  output = ""

  write(text: string) {
    this.output += text
  }

  writeln(text = "") {
    this.output += `${text}\n`
  }
}

function generate_exception(message = "the message"): Error {
  return new Error(message)
}

suite("BacktracePrinter", () => {
  test("#simplify is nonempty", () => {
    const error = generate_exception()
    const printer = new BacktracePrinter()

    const trace = printer.simplify(error.stack?.split("\n").slice(1) ?? [])

    assert(trace.length > 0)
  })

  test("#call prettifies paths", async () => {
    const project = process.cwd()
    const raw_trace = [
      `    at generate_exception (${path.join(project, "test", "backtrace_printer.ts")}:5:10)`,
      `    at test_prettify_path (${path.join(project, "test", "backtrace_printer.ts")}:19:5)`,
      `    at run_test (${path.join(project, "src", "execution_context.ts")}:284:31)`,
      `    at runner (${path.join(project, "src", "index.ts")}:50:3)`,
      `    at dependency (${path.join(project, "node_modules", "some-lib", "index.js")}:10:2)`,
      "    at node:internal/modules/run_main:101:5",
      "not a stack line",
    ]

    const writer = new MemoryWriter()
    const printer = new BacktracePrinter(writer)

    await printer.call(raw_trace)

    const separator = path.sep

    assert.equal(
      writer.output,
      [
        "┏ NODE: node:internal/modules/run_main:101 anonymous",
        `┃ LIB: node_modules${separator}some-lib${separator}index.js:10 dependency`,
        `┃ APP: src${separator}index.ts:50 runner`,
        `┃ APP: src${separator}execution_context.ts:284 run_test`,
        `┃ TEST: test${separator}backtrace_printer.ts:19 test_prettify_path`,
        `┗ TEST: test${separator}backtrace_printer.ts:5 generate_exception`,
        "",
      ].join("\n"),
    )
  })

  test("#call does not raise when path cannot be classified", async () => {
    const writer = new MemoryWriter()
    const printer = new BacktracePrinter(writer)

    await printer.call(["    at mystery (/tmp/outside.ts:1:2)"])

    assert(writer.output.includes("???: /tmp/outside.ts:1 mystery"))
  })

  test(".simplify_path detects pnpm workspace node_modules paths", () => {
    const dependency_path =
      "C:/Users/LF/workspaces/dev/sandhed/node_modules/.pnpm/microtest.ts@https+++codelo_hash/node_modules/microtest.ts/dist/cli.js"

    const [kind, simple_path] = BacktracePrinter.simplify_path(dependency_path)

    assert.equal(kind, BacktraceKind.Lib)
    assert.equal(
      simple_path,
      "LIB: node_modules/.pnpm/microtest.ts@https+++codelo_hash/node_modules/microtest.ts/dist/cli.js",
    )
  })
})
