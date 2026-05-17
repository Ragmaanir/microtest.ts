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
        if (!Object.is(actual, expected)) {
            throw new AssertionFailure(`expected ${format_value(actual)} to equal ${format_value(expected)}`);
        }
    }
    assert.equal = equal;
    function throws(fn, expected) {
        try {
            fn();
        }
        catch (error) {
            if (expected === undefined || matches_error(error, expected)) {
                return;
            }
            throw new AssertionFailure("thrown error did not match expectation");
        }
        throw new AssertionFailure("expected function to throw");
    }
    assert.throws = throws;
})(assert || (assert = {}));
