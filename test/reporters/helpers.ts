import { RunResult, SuiteResult, TestResult, TestStatus, type Writer } from "../../src/index.js"

export class MemoryWriter implements Writer {
  output = ""

  write(text: string) {
    this.output += text
  }

  writeln(text = "") {
    this.output += `${text}\n`
  }
}

export const passed_result = new TestResult("Reporter", "#passes", "Reporter#passes", TestStatus.Passed, 10)
export const failed_result = new TestResult(
  "Reporter",
  "#fails",
  "Reporter#fails",
  TestStatus.Failed,
  20,
  new Error("failed"),
)
export const errored_result = new TestResult(
  "Reporter",
  "#errors",
  "Reporter#errors",
  TestStatus.Errored,
  30,
  new Error("errored"),
)
export const skipped_result = new TestResult("Reporter", "#skips", "Reporter#skips", TestStatus.Skipped, 40)

export const all_results = [passed_result, failed_result, errored_result, skipped_result]

export function run_result(): RunResult {
  return new RunResult("reporter-seed", "failed", [new SuiteResult("Reporter", all_results, 100)], all_results, 100)
}
