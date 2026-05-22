export type Color = "green" | "red" | "yellow" | "gray";
export declare function colorize(text: string, color: Color, enabled: boolean): string;
export declare function should_use_color(option: boolean | "auto" | undefined): boolean;
