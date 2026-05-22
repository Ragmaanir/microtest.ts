import type { RGB } from "../color.js";
import type { Writer } from "../writer.js";
export declare class StdoutWriter implements Writer {
    private readonly use_colors;
    static default(use_colors: boolean | undefined): Writer;
    constructor(use_colors?: boolean);
    write(text: string, color?: RGB): void;
    writeln(text?: string, color?: RGB): void;
}
export declare const STDOUT_WRITER: StdoutWriter;
