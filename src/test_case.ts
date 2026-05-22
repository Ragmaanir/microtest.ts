export type TestFunction = () => void | Promise<void>

export class TestCase {
  constructor(
    readonly name: string,
    readonly fn: TestFunction | undefined,
    readonly focused: boolean,
    readonly skipped: boolean,
  ) {}
}
