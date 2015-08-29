import { test } from "tape"
import Emitter from "../dist/emitter"
class Subscriber extends Emitter {}

test("✈  Emitter", (t) => {
  t.ok(Emitter !== undefined, "is defined")

  const e = new Subscriber()
  t.deepEqual(e.events, [], "inherit events collection")

  e.on("my_event", (data) => {
    t.deepEqual(data, { data: 1 }, "notify events")
    t.end()
  })
  e.emit("my_event", { data: 1 })
})
