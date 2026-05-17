export declare class AssertionFailure extends Error {
    readonly name = "AssertionFailure";
}
export type ErrorClass = new (...args: never[]) => Error;
export declare function assert(condition: unknown): asserts condition;
export declare namespace assert {
    function equal<T>(actual: T, expected: T): void;
    function throws(fn: () => unknown, expected?: RegExp | string | ErrorClass): void;
}
