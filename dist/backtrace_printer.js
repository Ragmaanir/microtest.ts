import path from "node:path";
export var BacktraceKind;
(function (BacktraceKind) {
    BacktraceKind["App"] = "app";
    BacktraceKind["Test"] = "test";
    BacktraceKind["Lib"] = "lib";
    BacktraceKind["Node"] = "node";
    BacktraceKind["Eval"] = "eval";
    BacktraceKind["Unknown"] = "unknown";
})(BacktraceKind || (BacktraceKind = {}));
export class BacktraceEntry {
    kind;
    path;
    line;
    func;
    constructor(kind, path, line, func) {
        this.kind = kind;
        this.path = path;
        this.line = line;
        this.func = func;
    }
}
export class BacktracePrinter {
    static PROJECT_DIR = process.cwd();
    static PROJECT_SRC_DIR = path.join(BacktracePrinter.PROJECT_DIR, "src");
    static PROJECT_TEST_DIR = path.join(BacktracePrinter.PROJECT_DIR, "test");
    static PROJECT_NODE_MODULES_DIR = path.join(BacktracePrinter.PROJECT_DIR, "node_modules");
    static NODE_INTERNAL_PREFIX = "node:";
    static classify_path(file_path) {
        if (file_path.startsWith(BacktracePrinter.PROJECT_SRC_DIR)) {
            return BacktraceKind.App;
        }
        if (file_path.startsWith(BacktracePrinter.PROJECT_TEST_DIR)) {
            return BacktraceKind.Test;
        }
        if (file_path.startsWith(BacktracePrinter.PROJECT_NODE_MODULES_DIR)) {
            return BacktraceKind.Lib;
        }
        if (file_path.startsWith(BacktracePrinter.NODE_INTERNAL_PREFIX)) {
            return BacktraceKind.Node;
        }
        if (file_path.startsWith("eval")) {
            return BacktraceKind.Eval;
        }
        return BacktraceKind.Unknown;
    }
    static simplify_path(file_path) {
        const kind = BacktracePrinter.classify_path(file_path);
        switch (kind) {
            case BacktraceKind.App:
                return [kind, file_path.replace(BacktracePrinter.PROJECT_SRC_DIR, "APP: src")];
            case BacktraceKind.Test:
                return [kind, file_path.replace(BacktracePrinter.PROJECT_TEST_DIR, "TEST: test")];
            case BacktraceKind.Lib:
                return [kind, file_path.replace(BacktracePrinter.PROJECT_NODE_MODULES_DIR, "LIB: node_modules")];
            case BacktraceKind.Node:
                return [kind, `NODE: ${file_path}`];
            case BacktraceKind.Eval:
                return [kind, `EVAL: ${file_path}`];
            case BacktraceKind.Unknown:
                return [kind, `???: ${file_path}`];
        }
    }
    call(backtrace, highlight) {
        const entries = this.simplify(backtrace);
        const lines = entries.map((entry) => this.format_entry(entry, highlight));
        return this.grouped_lines(lines);
    }
    simplify(backtrace) {
        const entries = [];
        for (const line of backtrace) {
            const parsed = this.parse_line(line);
            if (parsed !== null) {
                const [kind, simple_path] = BacktracePrinter.simplify_path(parsed.file);
                entries.push(new BacktraceEntry(kind, simple_path, parsed.line, parsed.func));
            }
        }
        return entries.reverse();
    }
    parse_line(line) {
        const trimmed = line.trim();
        const match = /^at (?:(?<func>.*?) \()?(?<file>.+):(?<line>\d+):(?<column>\d+)\)?$/.exec(trimmed);
        if (match?.groups === undefined) {
            return null;
        }
        return {
            file: this.clean_file(match.groups.file),
            line: Number(match.groups.line),
            func: match.groups.func ?? "anonymous",
        };
    }
    clean_file(file) {
        if (file.startsWith("file:///")) {
            return file.slice("file:///".length);
        }
        return file;
    }
    format_entry(entry, highlight) {
        const func = highlight !== undefined && entry.func.includes(highlight) ? `**${entry.func}**` : entry.func;
        return `${entry.path}:${entry.line} ${func}`;
    }
    grouped_lines(lines) {
        if (lines.length === 0) {
            return "";
        }
        return `${lines
            .map((line, index) => {
            if (index === 0) {
                return `┏ ${line}`;
            }
            if (index === lines.length - 1) {
                return `┗ ${line}`;
            }
            return `┃ ${line}`;
        })
            .join("\n")}\n`;
    }
}
