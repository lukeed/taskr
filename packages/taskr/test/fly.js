"use strict"

const Promise = require("bluebird")
const join = require("path").join
const test = require("tape")

const Taskr = require("../lib/taskr")
const del = require("./helpers").del
const $ = require("../lib/fn")

const co = Promise.coroutine
const fixtures = join(__dirname, "fixtures")

test("Taskr.prototype", t => {
	t.ok(Taskr !== undefined, "is defined")

	const cmds = [
		"emit", "on", "plugin",
		"start", "serial", "parallel"
	]
	cmds.forEach(cmd => {
		t.equal(typeof Taskr.prototype[cmd], "function", `Taskr.prototype.${cmd} is defined`)
	})

	t.end()
})

test("Taskr.constructor (defaults)", t => {
	const taskr = new Taskr()

	t.true(taskr instanceof Taskr, "returns a Taskr class")
	t.equal(taskr.file, undefined, "`taskr.file` is `undefined`")
	t.equal(taskr.root, process.cwd(), "`taskr.root` is `process.cwd()`")
	t.true($.isEmptyObj(taskr.tasks), "`taskr.tasks` is an empty object")
	t.true($.isEmptyObj(taskr.plugins), "`taskr.plugins` is an empty object")
	t.true(Array.isArray(taskr.plugNames), "`taskr.plugNames` is an array")
	t.true(taskr.plugNames.length === 0, "`taskr.plugNames` is empty")

	t.end()
})

test("Taskr.constructor (values)", t => {
	const foo = { a: 'a', * b() {}}
	const fake = { file: "fake", cwd: fixtures, tasks: foo, plugins: foo }
	const taskr = new Taskr(fake)

	t.equal(taskr.file, fake.file, "accept `file` value")
	t.equal(taskr.root, fake.cwd, "accept `root|cwd` value")
	t.notEqual(taskr.plugins, fake.plugins, "reject invalid `plugins` value")
	t.notEqual(taskr.tasks, fake.tasks, "reject invalid `tasks` value")

	t.ok(taskr.tasks.b, "accept a `task` function")
	t.true($.isObject(taskr.tasks.b), "mount each `task` as an object")
	t.ok(taskr.tasks.b.data && taskr.tasks.b.func, "attach `data` and `func` keys to task's object")
	t.deepEqual(taskr.tasks.b.data, { files:[], globs:[], prevs:[] }, "start tasks with empty data arrays")
	t.notEqual(taskr.tasks.b.func, foo.b, "wrap the original function")

	t.end()
})

test("Taskr.constructor (exits)", t => {
	const fn = () => this.plugin("hello", {}, function * () {})
	const plugins = { plugins: [fn] }

	const t1 = new Taskr({ plugins, tasks:['foo'] })
	// test for `tasks_force_object` ?
	t1.on("tasks_force_object", () => console.log('HELLO?'))
	t.true(!t1.file && !t1.plugins, "exits EARLY if invalid `tasks` type")

	const t2 = new Taskr({ plugins })
	t.true(t2.hasOwnProperty('file') && t2.hasOwnProperty('tasks'), "constructs shape")
	t.true($.isEmptyObj(t2.plugins), "stops before `plugins` loop if no `tasks` or `file`")

	t.end()
})

test("Taskr.start", co(function* (t) {
	let val

	t.plan(13)

	const t1 = new Taskr({
		tasks: {
			* a() {
				val = 5
				t.pass("execute a task programmatically")
			}
		}
	})

	yield t1.start("a")
	t.equal(val, 5, "truly `await` a task's completion")

	const t2 = new Taskr({
		tasks: {
			* a() { },
			* err() {
				throw new Error()
			}
		}
	})

	t2.emit = e => {
		if (e === "task_not_found") {
			t.pass("notify when task not found")
		} else if (e === "task_start") {
			t.pass("notify when task starts")
		} else if (e === "task_complete") {
			t.pass("notify when task completes")
		} else if (e === "task_error") {
			t.pass("notify when task errors")
		}
	}

	yield t2.serial(["a", "b"])
	try {
		yield t2.start("err")
	} catch (e) {
		t.pass("task threw its own error")
	}

	const demo = { val: 5 }
	const t3 = new Taskr({
		tasks: {
			* a(f, obj) {
				t.ok(obj.val === demo.val, "pass a value to a task")
				t.ok("src" in obj, "a `src` key always exists")
				t.ok(obj.src === null, "the `src` key defaults to null")
				yield f.start("b")
				return obj.val
			},
			* b() {
				t.pass("start a task from within a task")
				yield Promise.resolve(4)
				return 4
			}
		}
	})

	const out = yield t3.start("a", demo)
	t.equal(out, demo.val, "tasks can return values directly")
}))

test("Taskr.parallel", co(function* (t) {
	t.plan(6)
	let int = 0
	const order = []
	const demo = { val: 10 }

	const taskr = new Taskr({
		tasks: {
			* a(f, opts) {
				yield Promise.delay(9)
				t.equal(opts.val, demo.val, "task-a got initial `opts` object")
				order.push("a")
				return int++
			},
			* b(f, opts) {
				yield Promise.delay(6)
				t.equal(opts.val, demo.val, "task-b got initial `opts` object")
				order.push("b")
				return int++
			},
			* c(f, opts) {
				yield Promise.delay(3)
				t.equal(opts.val, demo.val, "task-c got initial `opts` object")
				order.push("c")
				return int++
			}
		}
	})

	const out = yield taskr.parallel(["a", "b", "c"], demo)
	t.equal(out, undefined, "chain yields no return")
	t.equal(int, 3, "wait for the entire chain's completion")
	t.notDeepEqual(order, ["a", "b", "c"], "execution order is random")
}))

test("Taskr.parallel (sources)", co(function * (t) {
	t.plan(8)
	const ops = {every: 0, files: 0}
	const tmp = join(fixtures, ".tmp")
	// globs
	const foo = join(fixtures, "*.js")
	const bar = join(fixtures, "*.map")
	const baz = join(fixtures, "*.txt")
	const bat = join(fixtures, "bar.txt")

	const taskr = new Taskr({
		tasks: {
			* a(f) {
				yield f.source(foo).run(ops, function * (globs) {
					t.equal(globs[0], foo, "plugin receives correct `glob` parameter value")
					t.equal(f._.globs[0], foo, "source glob is assigned to instance")
				}).target(tmp)
			},
			* b(f) {
				yield f.source(bar).run(ops, function * (globs) {
					t.equal(globs[0], bar, "plugin receives correct `glob` parameter value")
					t.equal(f._.globs[0], bar, "source glob is assigned to instance")
				}).target(tmp)
			},
			* c(f) {
				yield f.source(baz).run(ops, function * (globs) {
					t.equal(globs[0], baz, "plugin receives correct `glob` parameter value")
					t.equal(f._.globs[0], baz, "source glob is assigned to instance")
				}).target(tmp)
			},
			* d(f) {
				yield f.source(bat).run(ops, function * (globs) {
					t.equal(globs[0], bat, "plugin receives correct `glob` parameter value")
					t.equal(f._.globs[0], bat, "source glob is assigned to instance")
				}).target(tmp)
			}
		}
	})

	yield taskr.parallel(["a", "b", "c", "d"])
	yield del(tmp)
}))

test("Taskr.serial", co(function* (t) {
	t.plan(7)

	const int = 3
	const order = []
	const t1 = new Taskr({
		tasks: {
			* a(f, opts) {
				yield Promise.delay(2)
				t.equal(opts.val, int, "task-a got initial `opts` object")
				order.push("a")
				return opts.val + 1
			},
			* b(f, opts) {
				yield Promise.delay(1)
				t.equal(opts.val, int + 1, "task-b got mutated `opts` object")
				order.push("b")
				return opts.val + 1
			},
			* c(f, opts) {
				yield Promise.delay(0)
				t.equal(opts.val, int + 2, "task-c got mutated `opts` object")
				order.push("c")
				return opts.val + 1
			}
		}
	})

	const out = yield t1.serial(["a", "b", "c"], { val: int })
	t.equal(out, int + 3, "chain yields final return value")
	t.deepEqual(order, ["a", "b", "c"], "execute tasks in order, regardless of delay")

	let num = 0
	const t2 = new Taskr({
		tasks: {
			* a() {
				num++
			},
			* c() {
				num++
			},
			* b() {
				num++
				throw new Error()
			}
		}
	})

	t2.emit = e => (e === "serial_error") && t.pass("notify when a task within `serial` throws")

	yield t2.serial(["a", "b", "c"])
	t.equal(num, 2, "interrupt `serial` on error only 2 tasks ran")
}))

test("Taskr.plugin (conflict)", co(function * (t) {
	t.plan(6)
	const expect = ["foo", "foo1"]
	const taskr = new Taskr({
		tasks: { *a(f) {} }
	})

	taskr.on("plugin_rename", (old, nxt) => {
		t.pass("emits `plugin_rename` on name conflict")
		t.notEqual(old, nxt, "new name differs from original")
		t.equal(old, "foo", "old name is preserved")
		t.equal(nxt, "foo1", "new name is changed")
	})

	Array("foo", "foo").forEach(name => taskr.plugin({ name, *func(){} }))

	t.equal(Object.keys(taskr.plugins).length, 2, "still mounts both plugins")
	t.deepEqual(taskr.plugNames, expect, "stores both plugin names, with change")
}))
