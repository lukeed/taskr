const test = require("tape").test
const reporter = require("../dist/reporter")

const fakeEmitter = (event, t) => ({
  on: function (e) {
    if (e === event) t.ok(true, "notify " + event + " events")
    return this
  }
})

test("✈  reporter", function (t) {
  const ctx = fakeEmitter()
  t.deepEqual(reporter.call(ctx), ctx, "return the bound object")
  Array.prototype.concat([
    "fly_run",
    "flyfile_not_found",
    "fly_watch",
    "plugin_load",
    "plugin_error",
    "task_error",
    "task_start",
    "task_complete",
    "task_not_found"
  ]).forEach((event) => reporter.call(fakeEmitter(event, t)))
  t.end()
})

test("✈  timeInfo", (t) => {
  const timeInfo = require("../dist/reporter/timeInfo")
  t.deepEqual(timeInfo(100), { duration: 100, scale: "ms" },
    "use 'ms' units by default.")
  t.deepEqual(timeInfo(1000), { duration: 1, scale: "s" },
    "convert long units to seconds.")
  t.end()
})
