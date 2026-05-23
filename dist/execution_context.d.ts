import { type Reporter, type Writer } from "./reporters.js";
import { RunResult } from "./results.js";
import { type AroundHookFunction, type HookFunction, Suite } from "./suite.js";
import { type TestFunction } from "./test_case.js";
export interface RunOptions {
    seed?: string;
    reporters?: Reporter[];
    writer?: Writer;
    use_colors?: boolean;
    set_exit_code?: boolean;
}
export declare class ExecutionContext {
    readonly suites: Suite[];
    readonly global_before_hooks: HookFunction[];
    readonly global_after_hooks: HookFunction[];
    readonly global_around_hooks: AroundHookFunction[];
    current_suite: Suite | null;
    running: boolean;
    suite(name: string, fn: () => void): void;
    before(fn: HookFunction): void;
    after(fn: HookFunction): void;
    around(fn: AroundHookFunction): void;
    test(name: string, fn: TestFunction | undefined, focused: boolean, skipped: boolean): void;
    global_before(fn: HookFunction): void;
    global_after(fn: HookFunction): void;
    global_around(fn: AroundHookFunction): void;
    run(options?: RunOptions): Promise<RunResult>;
    private require_current_suite;
    private make_seed;
    private is_assertion_failure;
    private run_hooks;
    private wrap_around_hooks;
    private normalize_reporters;
    private run_status_from_tests;
    private full_test_name;
    private run_suites;
    private run_suite;
    private run_test;
}
