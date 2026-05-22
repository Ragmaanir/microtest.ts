import { TestStatus } from "../results.js";
import { STDOUT_WRITER } from "./stdout_writer.js";
import { TerminalReporter } from "./terminal_reporter.js";
export class SummaryReporter extends TerminalReporter {
    constructor(writer = STDOUT_WRITER) {
        super(writer);
    }
    async run_end(event) {
        const counts = {
            [TestStatus.Passed]: 0,
            [TestStatus.Failed]: 0,
            [TestStatus.Errored]: 0,
            [TestStatus.Skipped]: 0,
            [TestStatus.Pending]: 0,
        };
        for (const test_result of event.result.tests) {
            counts[test_result.status] += 1;
        }
        await this.write(`seed ${event.result.seed}`);
        await this.write(` | ${event.result.duration_ms}ms`);
        await this.write(" | ");
        await this.write_count(counts, TestStatus.Passed, "passed");
        await this.write(", ");
        await this.write_count(counts, TestStatus.Failed, "failed");
        await this.write(", ");
        await this.write_count(counts, TestStatus.Errored, "errored");
        await this.write(", ");
        await this.write_count(counts, TestStatus.Skipped, "skipped");
        await this.write(", ");
        await this.write_count(counts, TestStatus.Pending, "pending");
        await this.writeln();
    }
    async write_count(counts, status, label) {
        const count = counts[status];
        const color = count > 0 ? TerminalReporter.DEFAULT_TEST_STATUS_COLORS[status] : undefined;
        await this.write(`${count} ${label}`, color);
    }
}
