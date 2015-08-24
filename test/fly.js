const co = require("co")
const read = require("mz/fs").readFile
const test = require("tape").test
const Fly = require("../dist/fly")
const join = require("path").join
const touch = require("touch")

test("✈  fly", function (t) {
  t.ok(Fly !== undefined, "is defined")
  Array.prototype.concat([
    "source",
    "filter",
    "watch",
    "unwrap",
    "exec",
    "start",
    "write",
    "clear",
    "concat",
    "target",
    "emit"
  ]).forEach((method) => t.ok(method !== undefined,
    method + " is defined"))
  t.end()
})

test("✈  fly.constructor", (t) => {
  const fly = new Fly({
    file: join(__dirname, "fixtures", "flyfile.js"),
    host: {
      task: function () {
        t.equal(fly, this, "bind tasks to fly instance")
      }
    }
  })
  t.ok(fly !== undefined, "create fly instance")
  t.ok(fly.tasks.task !== undefined, "load task from host")
  fly.tasks.task()
  t.deepEqual(fly.plugins, [], "no default plugins")
  t.equal(process.cwd(), join(__dirname, "fixtures"),
    "switch current working directory")
  t.equal(fly.file, join(__dirname, "fixtures", "flyfile.js"),
    "set file to path specified in the constructor")
  t.end()
})

test("✈  fly.source", (t) => {
  const fly = new Fly()
  fly.source([[[[["*.a", ["*.b"]]], ["*.c"]]]])
  t.deepEqual(fly._.globs, ["*.a", "*.b", "*.c"], "flatten globs")
  t.deepEqual(fly._.filters, [], "init empty filter list")
  t.end()
})

test("✈  fly.filter", (t) => {
  const fly = new Fly()
  fly.filter((src) => src.toLowerCase())

  t.equal(fly._.filters.length, 1, "add filter to filter collection")
  t.equal(fly._.filters[0].cb("FLY"), "fly",
    "add transform cb for anonymous filters")

  fly.filter("myFilter", (data) => {
    return {
      code: data.toString().toUpperCase(),
      ext: ".foo"
    }
  })

  t.ok(fly.myFilter instanceof Function,
    "add transform cb to fly instance for named filters")

  fly.myFilter({ secret: 42 })
  t.equal(fly._.filters[1].cb("fly").code, "FLY",
    "create transform cb function for named filter")
  t.equal(fly._.filters[1].cb("fly").ext, ".foo", "read extension from filter")
  t.equal(fly._.filters[1].options.secret, 42, "read options from filter")

  try { fly.filter("myFilter")
  } catch (e) { t.ok(true, "throw an error if filter already exists") }

  fly.source("")
  t.deepEqual(fly._.filters, [], "reset filter each time source is called")

  t.end()
})

test("✈  fly.watch", (t) => {
  t.plan(6)
  const glob = "flyfile.js"
  const path = join(__dirname, "fixtures", "flyfile.js")
  const fly = new Fly({
    file: path,
    host: {
      default: function* (data) {
        t.ok(true, "run tasks at least once")
        t.equal(data, 42, "pass options into task via start")
      }
    }
  })
  fly.emit = (event) => {
    if (event === "fly_watch") t.ok(true, "notify watch event to observers")
    return fly
  }
  fly.watch(glob, "default", { value: 42 }).then((watcher) => {
    t.ok(watcher.unwatch !== undefined, "watch promise resolves to a watcher")
    setTimeout(() =>{
    // hijack the task to test the watcher runs default when the glob changes
      fly.host.default = function* (data) {
        watcher.unwatch(glob)
        t.ok(true, "run given tasks when glob changes")
        t.equal(data, 42, "pass options into task via start on change")
      }
      touch(path)
    }, 10)
  })
})

test("✈  fly.unwrap", (t) => {
  t.plan(4)
  const files_x = ["a.x", "b.x", "c.x"]
  const files_y = ["a.y", "b.y", "c.y"]
  const files = files_x.concat(files_y)
  const paths = files.map((file) => {
    const path = join(__dirname, "fixtures", file)
    touch(path)
    return path
  })
  const fly = new Fly()
  co(function* () {
    yield fly.source("*.x").unwrap((f) => {
      t.deepEqual(f, files_x, "unwrap source globs with single entry point")
    })
    yield fly.source(["*.y"]).unwrap((f) => {
      t.deepEqual(f, files_y, "unwrap source globs with single entry point in array")
    })
    const result = yield fly.source(["*.x", "*.y"]).unwrap((f) => {
      t.deepEqual(f, files, "unwrap source globs with multiple entry points")
      return 42
    })
    t.equal(result, 42, "result is the return value from fulfilled handler")
    yield fly.clear(files)
  })
})

test("✈  fly.*exec", (t) => {
  t.plan(4)
  const fly = new Fly({
    host: {
      task: function* (data) {
        t.ok(true, "run a task")
        t.equal(data, "rosebud", "pass an initial value to task")
      }
    }
  })
  fly.emit = function (event, options) {
    if (event === "task_start")
      t.ok(true, "notify start event to observers")
    if (event === "task_complete")
      t.ok(true, "notify complete event to observers")
    return fly
  }
  co(fly.exec.bind(fly), "task", "rosebud")
})

test("✈  fly.start", (t) => {
  t.plan(3)
  const value = 42
  const fly = new Fly({
    host: {
      a: function* (data) {
        return data + 1
      },
      b: function* (data) {
        return data + 1
      },
      c: function* (data) {
        t.ok(true, "run a given list of tasks")
        t.equal(data, value + 2, "cascade return values")
        return data + 1
      }
    }
  })
  co(function* () {
    const result = yield fly.start(["a", "b", "c"], { value: value })
    t.equal(result, value + 3, "return last task value")
  })
})

test("✈  fly.start (order)", (t, state) => {
  t.plan(2)
  state = 0
  const fly = new Fly({
    host: {
    // when running in a sequence both b and c wait while a blocks.
    // when running in parallel, b and c run while a blocks. state
    // can only be 3 when each task runs in order.
      a: function* () {
        yield block()
        if (state === 0) state++
      },
      b: function* () { state++ },
      c: function* () { state++ }
    }
  })
  co(function* () {
    yield fly.start(["a", "b", "c"], { parallel: false })
    t.ok(state === 3, "run tasks in sequence")
    state = 0 // reset
    yield fly.start(["a", "b", "c"], { parallel: true })
    t.ok(state !== 3, "run tasks in parallel")
  })
  function block () {
    return new Promise((resolve) => setTimeout(() => resolve(), 200))
  }
})

test("✈  fly.clear", (t) => {
  t.plan(1)
  const paths = Array.prototype.concat(["tmp1", "tmp2", "tmp3"])
  .map((file) => {
    const path = join(__dirname, "fixtures", file)
    touch(path)
    return path
  })
  const fly = new Fly()
  co(function* () {
    yield fly.clear(paths)
    t.ok(true, "clear files from a given list of paths")
  })
})

test("✈  fly.concat", (t) => {
  const fly = new Fly()
  fly.concat("f")
  t.ok(fly._.write !== undefined, "add concat writer")
  t.end()
})

test("✈  fly.target", (t) => {
  t.plan(1)
  co(function* () {
    process.chdir(join(__dirname, "fixtures"))
    const fly = new Fly()
    yield fly
      .source("*.txt")
      .filter((data) => data.toString().toUpperCase())
      .target(".")

    yield fly
      .source("*.txt")
      .filter((data) => {
        t.ok(data.toString() === "FOO BAR\n", "resolve source, filters and writers")
        return data.toString().toLowerCase()
      })
      .target(".")
  })
})
