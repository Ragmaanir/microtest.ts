export class Suite {
    name;
    tests = [];
    before_hooks = [];
    after_hooks = [];
    around_hooks = [];
    constructor(name) {
        this.name = name;
    }
    add_test(test_case) {
        this.tests.push(test_case);
    }
    before(fn) {
        this.before_hooks.push(fn);
    }
    after(fn) {
        this.after_hooks.push(fn);
    }
    around(fn) {
        this.around_hooks.push(fn);
    }
}
