const test = require("tape").test
const extend = require("./helpers/extend")
const Emitter = require("../dist/emitter")
const Subscriber = extend(Emitter)

test("✈  Emitter", function (t) {
  t.ok(Emitter !== undefined, "is defined")

  const e = new Subscriber()
  t.deepEqual(e.events, [], "inherit events collection")

  e.on("my_event", function (data) {
    t.deepEqual(data, { data: 1 }, "notify events")
    t.end()
  })
  e.emit("my_event", { data: 1 })
})
