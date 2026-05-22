export type TestFunction = () => void | Promise<void>;
export declare class TestCase {
    readonly name: string;
    readonly fn: TestFunction | undefined;
    readonly focused: boolean;
    readonly skipped: boolean;
    constructor(name: string, fn: TestFunction | undefined, focused: boolean, skipped: boolean);
}
