import type { RGB } from "../color.js";
import { TestStatus } from "../results.js";
import type { Writer } from "../writer.js";
import { Reporter } from "./reporter.js";
export type ResultSymbols = Record<TestStatus, string>;
export declare const DOTS: ResultSymbols;
export declare const TICKS: ResultSymbols;
export declare abstract class TerminalReporter extends Reporter {
    protected readonly writer: Writer;
    protected constructor(writer?: Writer);
    protected write(text: string, color?: RGB): Promise<void>;
    protected writeln(text?: string, color?: RGB): Promise<void>;
}
