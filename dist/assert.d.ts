export declare class AssertionFailure extends Error {
    readonly name = "AssertionFailure";
}
export type ErrorClass = new (...args: never[]) => Error;
export type InstanceClass<T = unknown> = new (...args: never[]) => T;
export declare function assert(condition: unknown): asserts condition;
export declare namespace assert {
    function equal<T>(actual: T, expected: T): void;
    function fail(message: string): never;
    function instance<T>(value: unknown, expected: InstanceClass<T>): asserts value is T;
    function is(actual: unknown, expected: unknown): void;
    function ok(value: unknown): asserts value;
    function throws(fn: () => unknown, expected?: RegExp | string | ErrorClass): void;
    function unreachable(): never;
}
