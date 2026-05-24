import { AssertionFailure, assert, suite, test } from "../src/index.js"

suite("assert", () => {
  test("#call passes for truthy values", () => {
    assert(true)
  })

  test("#call throws AssertionFailure for falsy values", () => {
    assert.throws(() => assert(false), AssertionFailure)
  })

  test(".equal compares values", () => {
    assert.equal(1, 1)
    assert.equal({ a: [1, 2] }, { a: [1, 2] })
    assert.throws(() => assert.equal(1, 2), AssertionFailure)
  })

  test(".fail throws AssertionFailure", () => {
    assert.throws(() => assert.fail("boom"), AssertionFailure)
  })

  test(".instance checks value class", () => {
    assert.instance(new AssertionFailure("boom"), AssertionFailure)
    assert.throws(() => assert.instance("boom", AssertionFailure), AssertionFailure)
  })

  test(".is compares identity", () => {
    const value = { a: 1 }

    assert.is(value, value)
    assert.throws(() => assert.is({ a: 1 }, { a: 1 }), AssertionFailure)
  })

  test(".ok checks truthy values", () => {
    assert.ok(true)
    assert.throws(() => assert.ok(false), AssertionFailure)
  })

  test(".throws checks thrown errors", () => {
    assert.throws(() => {
      throw new Error("boom")
    }, "boom")
  })

  test(".unreachable throws AssertionFailure", () => {
    assert.throws(() => assert.unreachable(), AssertionFailure)
  })
})
