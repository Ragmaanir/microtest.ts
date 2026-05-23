import path from "node:path"
import { assert, BacktracePrinter, suite, test } from "../src/index.js"

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

  test("#call prettifies paths", () => {
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

    const printer = new BacktracePrinter()
    const pretty_trace = printer.call(raw_trace)
    const separator = path.sep

    assert.equal(
      pretty_trace,
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

  test("#call does not raise when path cannot be classified", () => {
    const printer = new BacktracePrinter()
    const pretty_trace = printer.call(["    at mystery (/tmp/outside.ts:1:2)"])

    assert(pretty_trace.includes("???: /tmp/outside.ts:1 mystery"))
  })
})
