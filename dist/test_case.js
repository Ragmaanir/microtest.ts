export class TestCase {
    name;
    fn;
    focused;
    skipped;
    constructor(name, fn, focused, skipped) {
        this.name = name;
        this.fn = fn;
        this.focused = focused;
        this.skipped = skipped;
    }
}
