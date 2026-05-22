import type { TestCase } from "./test_case.js";
export type HookFunction = () => void | Promise<void>;
export type AroundHookFunction = (next: () => Promise<void>) => void | Promise<void>;
export declare class Suite {
    readonly name: string;
    readonly tests: TestCase[];
    readonly before_hooks: HookFunction[];
    readonly after_hooks: HookFunction[];
    readonly around_hooks: AroundHookFunction[];
    constructor(name: string);
    add_test(test_case: TestCase): void;
    before(fn: HookFunction): void;
    after(fn: HookFunction): void;
    around(fn: AroundHookFunction): void;
}
