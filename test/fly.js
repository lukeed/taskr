"use strict"

const Promise = require("bluebird")
const join = require("path").join
const test = require("tape")

const Fly = require("../lib/fly")
const del = require("./helpers")
const $ = require("../lib/fn")

const co = Promise.coroutine
const fixtures = join(__dirname, "fixtures")

test("fly.prototype", t => {
	t.ok(Fly !== undefined, "is defined")

	const cmds = [
		"emit", "on", "plugin",
		"start", "serial", "parallel"
	]
	cmds.forEach(cmd => {
		t.equal(typeof Fly.prototype[cmd], "function", `Fly.prototype.${cmd} is defined`)
	})

	t.end()
})

test("fly.constructor (defaults)", t => {
	const fly = new Fly()

	t.true(fly instanceof Fly, "returns a Fly class")
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
	const fly = new Fly(fake)

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
	// test for `tasks_force_object`

	const fn = () => this.plugin("hello", {}, function * () {})
	const fly = new Fly({ plugins: [fn] })
	t.true($.isEmptyObj(fly.plugins), "stops before `plugins` loop if no `tasks` or `file`")
	t.end()
})

// test("fly.init", co(function* (t) {
// 	const RDY = "_ready"
// 	const fly1 = new Fly({
// 		tasks: {
// 			* a(f) {
// 				t.equal(f, fly1, "pass fly instance to tasks")
// 			}
// 		}
// 	})

// 	t.false(fly1[RDY], "is not ready before `fly.init`")

// 	fly1.init()

// 	t.true(fly1[RDY], "is ready after `fly.init`")

// 	fly1.tasks.a()

// 	const fly2 = new Fly({ tasks: [1, 2, 3] })
// 	fly2.on("tasks_force_object", () => {
// 		t.pass("emit an error if `tasks` is not an object")
// 	})
// 	fly2.init()

// 	t.end()
// }))

// test("fly.source", co(function* (t) {
// 	t.plan(18)

// 	const fly = new Fly()
// 	const glob1 = ["*.a", "*.b", "*.c"]
// 	const glob2 = join(fixtures, "*.*")
// 	const opts1 = { ignore: "foo" }

// 	fly.on("globs_no_match", (g, o) => {
// 		t.pass("notify when globs match no files")
// 		t.deepEqual(g, glob1, "warning receives the flattened globs")
// 		t.deepEqual(o, opts1, "warning receives the `expand` options")
// 	})

// 	const out = yield fly.source([[["*.a", ["*.b"]]], ["*.c"]], opts1)
// 	t.true("globs" in fly._ && "files" in fly._, "create `globs` and `files` keys within `fly._`")
// 	t.deepEqual(fly._.globs, glob1, "flatten nested globs")
// 	t.deepEqual(fly._.files, [], "return empty array if no files matched")
// 	t.equal(out, fly, "returns the bound instance")

// 	yield fly.source(glob2)
// 	t.true(Array.isArray(fly._.globs), "wrap a single glob string as an array")
// 	t.equal(fly._.globs[0], glob2, "update internal `source` keys each time")
// 	t.true(Array.isArray(fly._.files), "return an array of relevant files")
// 	t.equal(fly._.files.length, 4, "accepts wildcard extensions finds all files")
// 	const f1 = fly._.files[0]
// 	t.ok($.isObject(f1), "array contents are objects")
// 	t.ok("data" in f1, "add `data` key to `pathObject`")
// 	t.false("root" in f1, "delete `root` key from `pathObject`")
// 	t.false("name" in f1, "delete `name` key from `pathObject`")
// 	t.false("ext" in f1, "delete `ext` key from `pathObject`")
// 	t.ok(Buffer.isBuffer(f1.data), "file data is a `Buffer`")

// 	yield fly.source(glob2, { ignore: join(fixtures, "flyfile.js") })
// 	t.equal(fly._.files.length, 3, "send config options to `expand` (ignore key)")
// }))

test("fly.start", co(function* (t) {
	let val

	t.plan(12)

	const fly1 = new Fly({
		tasks: {
			* a() {
				val = 5
				t.pass("execute a task programmatically")
			}
		}
	})

	yield fly1.start("a")
	t.equal(val, 5, "truly `await` a task's completion")

	const fly2 = new Fly({
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

	yield fly2.start("a")
	try {
		yield fly2.start("err")
	} catch (e) {
		t.pass("task threw its own error")
	}

	const demo = { val: 5 }
	const fly3 = new Fly({
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

	const fly = new Fly({
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

	const fly = new Fly({
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
	const fly1 = new Fly({
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
	const fly2 = new Fly({
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

// test("fly.run", co(function* (t) {
// 	t.plan(9)
// 	const src = join(fixtures, "*.txt")
// 	const tar = join(fixtures, ".tmp")

// 	const fly = new Fly({
// 		tasks: {
// 			* a(f, o) {
// 				const t = o.val
// 				yield f.source(src).run({}, function* (file) {
// 					t.true($.isObject(file), "iterate thru each `file` by default")
// 					t.true("data" in file, "entire `file` object is accessed")
// 					file.data = new Buffer(file.data.toString().toUpperCase())
// 				}).target(tar)
// 			},
// 			* b(f, o) {
// 				const t = o.val
// 				yield f.source(src).run({ every: 0 }, function* (files) {
// 					t.true(Array.isArray(files), "allow inline `run` to use `every: 0`")
// 				}).target(tar)
// 			}
// 		}
// 	})

// 	yield fly.start("a", { val: t })
// 	const arr1 = yield fly.$.expand(`${tar}/*.txt`)
// 	t.equal(arr1.length, 2, "place files in target destination after `inline` method")
// 	const str1 = yield fly.$.read(`${tar}/foo.txt`, "utf8")
// 	const str2 = yield fly.$.read(`${tar}/bar.txt`, "utf8")
// 	t.equal(str1, "FOO BAR\n", "capitalize file contents individually")
// 	t.equal(str2, "BAR BAZ\n", "capitalize file contents individually")
// 	yield del(tar)

// 	yield fly.start("b", { val: t })
// 	const arr2 = yield fly.$.expand(`${tar}/*.txt`)
// 	t.equal(arr2.length, 2, "place files in target destination after `inline` method")
// 	yield del(tar)
// }))

// test("fly.target", co(function* (t) {
// 	const glob1 = join(fixtures, "one", "two", "*.md")
// 	const glob2 = join(fixtures, "one", "*.md")
// 	const glob3 = join(fixtures, "**", "*.md")
// 	const glob4 = join(fixtures, "one", "**", "*.md")

// 	const dest1 = join(fixtures, ".tmp1")
// 	const dest2 = join(fixtures, ".tmp2")
// 	const dest3 = join(fixtures, ".tmp3")
// 	const dest4 = join(fixtures, ".tmp4")
// 	const dest5 = join(fixtures, ".tmp5")
// 	const dest6 = join(fixtures, ".tmp6")

// 	const fly = new Fly({
// 		plugins: [{
// 			name: "fakeConcat",
// 			func() {
// 				this.plugin("fakeConcat", { every: 0 }, function* (all) {
// 					this._.files = [{ dir: all[0].dir, base: "fake.foo", data: new Buffer("bar") }]
// 				})
// 			}
// 		}]
// 	})

// 	// clean slate
// 	yield del([dest1, dest2, dest3, dest4, dest5])

// 	// test #1
// 	yield fly.source(glob1).target(dest1)
// 	t.pass("allow method chains!")
// 	const val1 = join(dest1, "two", "two-1.md")
// 	const str1 = yield fly.$.find(val1)
// 	const arr1 = yield fly.$.expand(join(dest1, "*.md"))
// 	t.equal(arr1.length, 2, "via `src/one/two/*.md` write all files")
// 	t.ok(str1 && str1 !== val1, "via `src/one/two/*.md` did not create sub-dir if unwanted")

// 	// test #2
// 	yield fly.source(glob2).target(dest2)
// 	const arr2 = yield fly.$.expand(join(dest2, "*.md"))
// 	const str2 = yield fly.$.find(join(dest2, "one.md"))
// 	t.equal(arr2.length, 1, "via `src/one/*.md` write all files")
// 	t.ok(str2.length, "via `src/one/*.md` write to correct tier")

// 	// test #3
// 	yield fly.source(glob3).target(dest3)
// 	const arr3 = yield fly.$.expand(join(dest3, "**", "*.md"))
// 	const str3 = yield fly.$.find(join(dest3, "one", "two", "two-1.md"))
// 	t.ok(str3.length, "via `src/**/*.md` create the (nested) child directory")
// 	t.equal(arr3.length, 3, "via `src/**/*.md` write all files")

// 	// test #4
// 	yield fly.source(glob4).target([dest4, dest5])
// 	const str4 = yield fly.$.find(join(dest4, "two", "two-1.md"))
// 	const str5 = yield fly.$.find(join(dest5, "two", "two-1.md"))
// 	t.true(str4.length && str5.length, "write to multiple targets")

// 	yield fly.source(glob4).target(dest6).fakeConcat().target(`${dest6}/sub`)
// 	t.pass("allow `target()` to be chained")
// 	const str6 = yield fly.$.find(join(dest6, "two", "two-1.md"))
// 	const str7 = yield fly.$.find(join(dest6, "sub", "fake.foo"))
// 	t.true(str6.length && str7.length, "perform all actions in double-target chain")

// 	// clean up
// 	yield del([dest1, dest2, dest3, dest4, dest5, dest6])

// 	t.end()
// }))

