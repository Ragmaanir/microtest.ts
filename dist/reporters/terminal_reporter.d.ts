import type { RGB } from "../color.js";
import { TestStatus } from "../results.js";
import { Reporter, type Writer } from "./reporter.js";
export type ResultSymbols = Record<TestStatus, string>;
export declare const DOTS: ResultSymbols;
export declare const TICKS: ResultSymbols;
export declare abstract class TerminalReporter extends Reporter {
    protected readonly writer: Writer;
    protected constructor(writer?: Writer, use_colors?: boolean);
    protected readonly use_colors: boolean;
    protected write(text: string, color?: RGB): Promise<void>;
    protected writeln(text?: string, color?: RGB): Promise<void>;
}
