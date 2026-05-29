export declare class Path {
    static normalize(file_path: string): string;
    static starts_with(file_path: string, prefix: string): boolean;
    static replace_prefix(file_path: string, prefix: string, replacement: string): string;
    static segment_index(file_path: string, segment: string): number | null;
}
