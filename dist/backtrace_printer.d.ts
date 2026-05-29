import { type RGB } from "./color.js";
import type { Writer } from "./writer.js";
export declare enum BacktraceKind {
    App = "app",
    Test = "test",
    Lib = "lib",
    Node = "node",
    Eval = "eval",
    Unknown = "unknown"
}
export declare class BacktraceEntry {
    readonly kind: BacktraceKind;
    readonly path: string;
    readonly line: number;
    readonly func: string;
    constructor(kind: BacktraceKind, path: string, line: number, func: string);
}
export declare class BacktracePrinter {
    private readonly writer;
    static readonly PROJECT_DIR: string;
    static readonly PROJECT_SRC_DIR: string;
    static readonly PROJECT_TEST_DIR: string;
    static readonly PROJECT_NODE_MODULES_DIR: string;
    static readonly NODE_MODULES_DIR_NAME = "node_modules";
    static readonly NODE_INTERNAL_PREFIX = "node:";
    static readonly BACKTRACE_KIND_COLORS: Record<BacktraceKind, RGB>;
    constructor(writer?: Writer);
    static classify_path(file_path: string): BacktraceKind;
    static simplify_path(file_path: string): [BacktraceKind, string];
    private static simplify_node_modules_path;
    call(backtrace: readonly string[], highlight?: string): Promise<void>;
    simplify(backtrace: readonly string[]): BacktraceEntry[];
    private parse_line;
    private clean_file;
    private write_grouped_entries;
    private line_marker;
    private func_color;
}
