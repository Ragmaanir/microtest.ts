import { isDeepStrictEqual } from "node:util";
export class AssertionFailure extends Error {
    name = "AssertionFailure";
}
function format_value(value) {
    if (typeof value === "string") {
        return JSON.stringify(value);
    }
    return String(value);
}
function matches_error(error, expected) {
    if (typeof expected === "string") {
        return error instanceof Error && error.message.includes(expected);
    }
    if (expected instanceof RegExp) {
        return error instanceof Error && expected.test(error.message);
    }
    return error instanceof expected;
}
export function assert(condition) {
    if (!condition) {
        throw new AssertionFailure("assertion failed");
    }
}
(function (assert) {
    function equal(actual, expected) {
        if (!isDeepStrictEqual(actual, expected)) {
            fail(`expected ${format_value(actual)} to equal ${format_value(expected)}`);
        }
    }
    assert.equal = equal;
    function fail(message) {
        throw new AssertionFailure(message);
    }
    assert.fail = fail;
    function instance(value, expected) {
        if (!(value instanceof expected)) {
            fail(`expected ${format_value(value)} to be an instance of ${expected.name}`);
        }
    }
    assert.instance = instance;
    function is(actual, expected) {
        if (!Object.is(actual, expected)) {
            fail(`expected ${format_value(actual)} to be ${format_value(expected)}`);
        }
    }
    assert.is = is;
    function ok(value) {
        assert(value);
    }
    assert.ok = ok;
    function throws(fn, expected) {
        try {
            fn();
        }
        catch (error) {
            if (expected === undefined || matches_error(error, expected)) {
                return;
            }
            fail("thrown error did not match expectation");
        }
        fail("expected function to throw");
    }
    assert.throws = throws;
    function unreachable() {
        fail("unreachable");
    }
    assert.unreachable = unreachable;
})(assert || (assert = {}));
