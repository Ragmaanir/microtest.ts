import path from "node:path";
import { CYAN, DARK_GRAY, LIGHT_MAGENTA, MAGENTA, YELLOW } from "./color.js";
import { Path } from "./path.js";
import { STDOUT_WRITER } from "./reporters.js";
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
    writer;
    static PROJECT_DIR = process.cwd();
    static PROJECT_SRC_DIR = path.join(BacktracePrinter.PROJECT_DIR, "src");
    static PROJECT_TEST_DIR = path.join(BacktracePrinter.PROJECT_DIR, "test");
    static PROJECT_NODE_MODULES_DIR = path.join(BacktracePrinter.PROJECT_DIR, "node_modules");
    static NODE_MODULES_DIR_NAME = "node_modules";
    static NODE_INTERNAL_PREFIX = "node:";
    static BACKTRACE_KIND_COLORS = {
        [BacktraceKind.App]: LIGHT_MAGENTA,
        [BacktraceKind.Test]: LIGHT_MAGENTA,
        [BacktraceKind.Lib]: MAGENTA,
        [BacktraceKind.Node]: DARK_GRAY,
        [BacktraceKind.Eval]: DARK_GRAY,
        [BacktraceKind.Unknown]: CYAN,
    };
    constructor(writer = STDOUT_WRITER) {
        this.writer = writer;
    }
    static classify_path(file_path) {
        if (Path.starts_with(file_path, BacktracePrinter.PROJECT_SRC_DIR)) {
            return BacktraceKind.App;
        }
        if (Path.starts_with(file_path, BacktracePrinter.PROJECT_TEST_DIR)) {
            return BacktraceKind.Test;
        }
        if (Path.segment_index(file_path, BacktracePrinter.NODE_MODULES_DIR_NAME) !== null) {
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
                return [kind, Path.replace_prefix(file_path, BacktracePrinter.PROJECT_SRC_DIR, "APP: src")];
            case BacktraceKind.Test:
                return [kind, Path.replace_prefix(file_path, BacktracePrinter.PROJECT_TEST_DIR, "TEST: test")];
            case BacktraceKind.Lib:
                return [kind, BacktracePrinter.simplify_node_modules_path(file_path)];
            case BacktraceKind.Node:
                return [kind, `NODE: ${file_path}`];
            case BacktraceKind.Eval:
                return [kind, `EVAL: ${file_path}`];
            case BacktraceKind.Unknown:
                return [kind, `???: ${file_path}`];
        }
    }
    static simplify_node_modules_path(file_path) {
        const index = Path.segment_index(file_path, BacktracePrinter.NODE_MODULES_DIR_NAME);
        if (index === null) {
            return `???: ${file_path}`;
        }
        return `LIB: ${file_path.slice(index)}`;
    }
    async call(backtrace, highlight) {
        const entries = this.simplify(backtrace);
        await this.write_grouped_entries(entries, highlight);
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
    async write_grouped_entries(entries, highlight) {
        for (let index = 0; index < entries.length; index += 1) {
            const entry = entries[index];
            const marker = this.line_marker(index, entries.length);
            await this.writer.write(`${marker} `, DARK_GRAY);
            await this.writer.write(entry.path, BacktracePrinter.BACKTRACE_KIND_COLORS[entry.kind]);
            await this.writer.write(`:${entry.line} `, DARK_GRAY);
            await this.writer.writeln(entry.func, this.func_color(entry, highlight));
        }
    }
    line_marker(index, length) {
        if (index === 0) {
            return "┏";
        }
        if (index === length - 1) {
            return "┗";
        }
        return "┃";
    }
    func_color(entry, highlight) {
        if (highlight !== undefined && entry.func.includes(highlight)) {
            return YELLOW;
        }
        if (entry.kind === BacktraceKind.App || entry.kind === BacktraceKind.Test) {
            return YELLOW;
        }
        return DARK_GRAY;
    }
}
