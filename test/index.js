const test = require("tape").test
const Fly = require("../dist/fly")

test("Testing Fly ~~%", function (t) {
  t.ok(Fly !== undefined, "It's real.")
  t.end()
})
