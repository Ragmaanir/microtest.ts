export declare class RGB {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    constructor(r: number, g: number, b: number);
    colorize(text: string, enabled?: boolean): string;
}
export declare const GREEN: RGB;
export declare const RED: RGB;
export declare const YELLOW: RGB;
export declare const GRAY: RGB;
export declare const DARK_GRAY: RGB;
export declare const LIGHT_MAGENTA: RGB;
export declare const MAGENTA: RGB;
export declare const CYAN: RGB;
