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
    static readonly PROJECT_DIR: string;
    static readonly PROJECT_SRC_DIR: string;
    static readonly PROJECT_TEST_DIR: string;
    static readonly PROJECT_NODE_MODULES_DIR: string;
    static readonly NODE_INTERNAL_PREFIX = "node:";
    static classify_path(file_path: string): BacktraceKind;
    static simplify_path(file_path: string): [BacktraceKind, string];
    call(backtrace: readonly string[], highlight?: string): string;
    simplify(backtrace: readonly string[]): BacktraceEntry[];
    private parse_line;
    private clean_file;
    private format_entry;
    private grouped_lines;
}
