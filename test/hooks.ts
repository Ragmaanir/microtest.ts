import { after, around, assert, before, Microtest, suite, test } from "../src/index.js"

Microtest.around(async (next) => {
  await next()
})

suite("hooks", () => {
  const events: string[] = []

  before(() => {
    events.push("before")
  })

  around(async (next) => {
    events.push("around before")
    await next()
    events.push("around after")
  })

  after(() => {
    assert.equal(events.join(","), "before,around before,test,around after")
  })

  test("#order", () => {
    events.push("test")
  })
})
