export declare class Rand {
    private state;
    constructor(seed: string);
    next(): number;
    shuffle<T>(items: readonly T[]): T[];
    private static hash;
}
