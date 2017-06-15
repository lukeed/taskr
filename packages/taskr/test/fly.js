"use strict"

const Promise = require("bluebird")
const join = require("path").join
const test = require("tape")

const Taskr = require("../lib/fly")
const del = require("./helpers").del
const $ = require("../lib/fn")

const co = Promise.coroutine
const fixtures = join(__dirname, "fixtures")

test("fly.prototype", t => {
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

test("fly.constructor (defaults)", t => {
	const fly = new Taskr()

	t.true(fly instanceof Taskr, "returns a Taskr class")
	t.equal(fly.file, undefined, "`fly.file` is `undefined`")
	t.equal(fly.root, process.cwd(), "`fly.root` is `process.cwd()`")
	t.true($.isEmptyObj(fly.tasks), "`fly.tasks` is an empty object")
	t.true($.isEmptyObj(fly.plugins), "`fly.plugins` is an empty object")
	t.true(Array.isArray(fly.plugNames), "`fly.plugNames` is an array")
	t.true(fly.plugNames.length === 0, "`fly.plugNames` is empty")

	t.end()
})

test("fly.constructor (values)", t => {
	const foo = { a: 'a', * b() {}}
	const fake = { file: "fake", cwd: fixtures, tasks: foo, plugins: foo }
	const fly = new Taskr(fake)

	t.equal(fly.file, fake.file, "accept `file` value")
	t.equal(fly.root, fake.cwd, "accept `root|cwd` value")
	t.notEqual(fly.plugins, fake.plugins, "reject invalid `plugins` value")
	t.notEqual(fly.tasks, fake.tasks, "reject invalid `tasks` value")

	t.ok(fly.tasks.b, "accept a `task` function")
	t.true($.isObject(fly.tasks.b), "mount each `task` as an object")
	t.ok(fly.tasks.b.data && fly.tasks.b.func, "attach `data` and `func` keys to task's object")
	t.deepEqual(fly.tasks.b.data, {files: [], globs: [], prevs: []}, "start tasks with empty data arrays")
	t.notEqual(fly.tasks.b.func, foo.b, "wrap the original function")

	t.end()
})

test("fly.constructor (exits)", t => {
	const fn = () => this.plugin("hello", {}, function * () {})
	const plugins = { plugins: [fn] }

	const fly1 = new Taskr({ plugins, tasks: ['foo'] })
	// test for `tasks_force_object` ?
	fly1.on("tasks_force_object", () => console.log('HELLO?'))
	t.true(!fly1.file && !fly1.plugins, "exits EARLY if invalid `tasks` type")

	const fly2 = new Taskr({ plugins })
	t.true(fly2.hasOwnProperty('file') && fly2.hasOwnProperty('tasks'), "constructs shape")
	t.true($.isEmptyObj(fly2.plugins), "stops before `plugins` loop if no `tasks` or `file`")

	t.end()
})

test("fly.start", co(function* (t) {
	let val

	t.plan(13)

	const fly1 = new Taskr({
		tasks: {
			* a() {
				val = 5
				t.pass("execute a task programmatically")
			}
		}
	})

	yield fly1.start("a")
	t.equal(val, 5, "truly `await` a task's completion")

	const fly2 = new Taskr({
		tasks: {
			* a() { },
			* err() {
				throw new Error()
			}
		}
	})

	fly2.emit = e => {
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

	yield fly2.serial(["a", "b"])
	try {
		yield fly2.start("err")
	} catch (e) {
		t.pass("task threw its own error")
	}

	const demo = { val: 5 }
	const fly3 = new Taskr({
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

	const out = yield fly3.start("a", demo)
	t.equal(out, demo.val, "tasks can return values directly")
}))

test("fly.parallel", co(function* (t) {
	t.plan(6)
	let int = 0
	const order = []
	const demo = { val: 10 }

	const fly = new Taskr({
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

	const out = yield fly.parallel(["a", "b", "c"], demo)
	t.equal(out, undefined, "chain yields no return")
	t.equal(int, 3, "wait for the entire chain's completion")
	t.notDeepEqual(order, ["a", "b", "c"], "execution order is random")
}))

test("fly.parallel (sources)", co(function * (t) {
	t.plan(8)
	const ops = {every: 0, files: 0}
	const tmp = join(fixtures, ".tmp")
	// globs
	const foo = join(fixtures, "*.js")
	const bar = join(fixtures, "*.map")
	const baz = join(fixtures, "*.txt")
	const bat = join(fixtures, "bar.txt")

	const fly = new Taskr({
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

	yield fly.parallel(["a", "b", "c", "d"])
	yield del(tmp)
}))

test("fly.serial", co(function* (t) {
	t.plan(7)

	const int = 3
	const order = []
	const fly1 = new Taskr({
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

	const out = yield fly1.serial(["a", "b", "c"], { val: int })
	t.equal(out, int + 3, "chain yields final return value")
	t.deepEqual(order, ["a", "b", "c"], "execute tasks in order, regardless of delay")

	let num = 0
	const fly2 = new Taskr({
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

	fly2.emit = e => (e === "serial_error") && t.pass("notify when a task within `serial` throws")

	yield fly2.serial(["a", "b", "c"])
	t.equal(num, 2, "interrupt `serial` on error only 2 tasks ran")
}))

test("fly.plugin (conflict)", co(function * (t) {
	t.plan(6)
	const expect = ["foo", "foo1"]
	const fly = new Taskr({
		tasks: { *a(f) {} }
	})

	fly.on("plugin_rename", (old, nxt) => {
		t.pass("emits `plugin_rename` on name conflict")
		t.notEqual(old, nxt, "new name differs from original")
		t.equal(old, "foo", "old name is preserved")
		t.equal(nxt, "foo1", "new name is changed")
	})

	Array("foo", "foo").forEach(name => fly.plugin({ name, *func(){} }))

	t.equal(Object.keys(fly.plugins).length, 2, "still mounts both plugins")
	t.deepEqual(fly.plugNames, expect, "stores both plugin names, with change")
}))
