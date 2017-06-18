"use strict"

const Promise = require("bluebird")
const join = require("path").join
const test = require("tape")

const del = require("./helpers").del
const isMode = require("./helpers").isMode
const Taskr = require("../lib/taskr")
const Task = require("../lib/task")
const $ = require("../lib/fn")

const protos = ["source", "target", "start", "parallel", "serial", "emit", "run", "exec"]
const fixtures = join(__dirname, "fixtures")
const co = Promise.coroutine

test("Task.constructor (basic)", co(function * (t) {
	const taskr = new Taskr()
	const task = new Task(taskr)
	t.true($.isObject(task), "returns an object")
	protos.forEach(str => {
		t.true(task.hasOwnProperty(str), `Task.prototype.${str} is defined`)
	})
	t.end()
}))

test("Task.constructor (plugins)", co(function * (t) {
	const taskr = new Taskr({
		tasks: { *a(){} },
		plugins: [{ name: "foo", *func(){} }]
	})
	const task = new Task(taskr)
	t.true(task.hasOwnProperty("foo"), "inherits the `foo()` plugin")
	t.equal(typeof task.foo, "function", "mounts correctly as a function")
	t.end()
}))

test("task.constructor (internal)", co(function * (t) {
	t.plan(30)

	const taskr = new Taskr({
		tasks: {
			*foo(f) {
				t.true(f instanceof Task, "task receives bound Task instance")
				protos.forEach(str => t.true(str in f, `Task.prototype.${str} is defined`))
				t.true(f.hasOwnProperty("_") && $.isObject(f._), "task contains internal `_` object")
				t.true(f.hasOwnProperty("$") && $.isObject(f.$), "task accesses all `$` helpers")
				Array("files", "globs", "prevs").forEach(str => {
					t.true(f._.hasOwnProperty(str), `task._.${str} is defined`)
					t.true(Array.isArray(f._[str]), `task._.${str} is an array`)
					t.equal(f._[str].length, 0, `task._.${str} is empty`)
				})
				t.true(f.hasOwnProperty("root"), "task exposes a `root` key")
				t.equal(typeof f.root, "string", "task's `root` is a string")
				t.equal(f.root, process.cwd(), "task inherits `root` value")
			},
			*bar(f, o) {
				t.true(o !== undefined, "task receives a 2nd parameter")
				t.true($.isObject(o), "task's config is an object by default")
				Array("val", "src").forEach(el => {
					t.true(o.hasOwnProperty(el), `task config object has \`${el}\` key`)
					t.equal(o[el], null, `task \`opts.${el}\` is \`null\` by default`)
				})
			},
			*baz(f, o) {
				t.equal(o.val, 5, "task config can be customized (opts.val)")
			}
		}
	})

	yield taskr.parallel(["foo", "bar"]).start("baz", {val: 5})
}))

test("task.source", co(function * (t) {
	t.plan(18)

	const glob1 = ["*.a", "*.b", "*.c"]
	const glob2 = join(fixtures, "*.*")
	const opts1 = { ignore: "foo" }

	const taskr = new Taskr({
		tasks: {
			*foo(f) {
				yield f.source([[["*.a", ["*.b"]]], ["*.c"]], opts1)
				t.deepEqual(f._.globs, glob1, "flattens deeply nested globs")
				t.deepEqual(f._.files, [], "returns empty array when no files matched")
			},
			*bar(f) {
				yield f.source(glob2)
				t.true(Array.isArray(f._.globs), "converts a single glob to an array")
				t.equal(f._.globs[0], glob2, "updates internal source knowledge")
				t.true(Array.isArray(f._.files), "returns array of matching files")
				t.equal(f._.files.length, 4, "accepts wildcard extensions to find all files")

				const f1 = f._.files[0]
				t.true($.isObject(f1), "array members are file objects")
				t.true(f1.hasOwnProperty("data"), "adds `data` key to `pathObject`")
				t.true(f1.hasOwnProperty("base"), "keeps `base` key from `pathObject`")
				t.true(f1.hasOwnProperty("dir"), "keeps `dir` key from `pathObject`")
				t.false(f1.hasOwnProperty("root"), "deletes `root` key from `pathObject`")
				t.false(f1.hasOwnProperty("name"), "deletes `name` key from `pathObject`")
				t.false(f1.hasOwnProperty("ext"), "deletes `ext` key from `pathObject`")
				t.ok(Buffer.isBuffer(f1.data), "file's `data` is a `Buffer`")
			},
			*baz(f) {
				yield f.source(glob2, { ignore: join(fixtures, "taskfile.js") })
				t.equal(f._.files.length, 3, "tunnels options to `utils.expand` (ignore)")
			}
		}
	})

	taskr.on("globs_no_match", (g, o) => {
		t.pass("notify when globs match no files")
		t.deepEqual(g, glob1, "warning receives the flattened globs")
		t.deepEqual(o, opts1, "warning receives the `expand` options")
	})

	yield taskr.parallel(["foo", "bar", "baz"])
}))

test("task.target", co(function * (t) {
	t.plan(11)
	const glob1 = join(fixtures, "one", "two", "*.md")
	const glob2 = join(fixtures, "one", "*.md")
	const glob3 = join(fixtures, "**", "*.md")
	const glob4 = join(fixtures, "one", "**", "*.md")

	const dest1 = join(fixtures, ".tmp1")
	const dest2 = join(fixtures, ".tmp2")
	const dest3 = join(fixtures, ".tmp3")
	const dest4 = join(fixtures, ".tmp4")
	const dest5 = join(fixtures, ".tmp5")
	const dest6 = join(fixtures, ".tmp6")

	// clean slate
	yield del([dest1, dest2, dest3, dest4, dest5])

	const taskr = new Taskr({
		plugins: [{
			every: 0,
			name: "fakeConcat",
			*func(all) {
				this._.files = [{ dir: all[0].dir, base: "fake.foo", data: new Buffer("bar") }]
			}
		}],
		tasks: {
			*a(f) {
				yield f.source(glob1).target(dest1)
				t.pass("allow method chains!")

				const g = join(dest1, "*.md")
				const v = join(dest1, "two", "two-1.md")

				const str = yield f.$.find(v)
				const arr = yield f.$.expand(g)
				t.equal(arr.length, 2, "via `src/one/two/*.md` write all files")
				t.equal(str, null, "via `src/one/two/*.md` did not create sub-dir if unwanted")
			},
			*b(f) {
				yield f.source(glob2).target(dest2)
				const arr = yield f.$.expand(join(dest2, "*.md"))
				const str = yield f.$.find(join(dest2, "one.md"))
				t.equal(arr.length, 1, "via `src/one/*.md` write all files")
				t.ok(str.length, "via `src/one/*.md` write to correct tier")
			},
			*c(f) {
				yield f.source(glob3).target(dest3)
				const arr = yield f.$.expand(join(dest3, "**", "*.md"))
				const str = yield f.$.find(join(dest3, "one", "two", "two-1.md"))
				t.ok(str.length, "via `src/**/*.md` create the (nested) child directory")
				t.equal(arr.length, 3, "via `src/**/*.md` write all files")
			},
			*d(f) {
				yield f.source(glob4).target([dest4, dest5])
				const str1 = yield f.$.find(join(dest4, "two", "two-1.md"))
				const str2 = yield f.$.find(join(dest5, "two", "two-1.md"))
				t.true(str1.length && str2.length, "write to multiple targets")
			},
			*e(f) {
				yield f.source(glob4).target(dest6).fakeConcat().target(`${dest6}/sub`)
				t.pass("allow `target()` to be chained")
				const str1 = yield f.$.find(join(dest6, "two", "two-1.md"))
				const str2 = yield f.$.find(join(dest6, "sub", "fake.foo"))
				t.true(str1.length && str2.length, "perform all actions in double-target chain")
			},
			*f(f) {
				const src = join(fixtures, "bar.txt")
				yield f.source(src).target(dest1, {mode: 0o755})
				const isExe = yield isMode(`${dest1}/bar.txt`, 755)
				t.true(isExe, "pass `mode` option to `utils.write`")
			}
		}
	})

	yield taskr.parallel(["a", "b", "c", "d", "e", "f"])
	// clean up
	yield del([dest1, dest2, dest3, dest4, dest5, dest6])
}))

test("task.run (w/function)", co(function * (t) {
	t.plan(10)
	const src = join(fixtures, "*.txt")

	const taskr = new Taskr({
		tasks: {
			*foo(f) {
				const tar = join(fixtures, ".tmp1")
				yield f.source(src).run({}, function * (file) {
					t.true($.isObject(file), "iterates thru each `file` (default)")
					t.true(file.hasOwnProperty("data"), "receives entire `file` object")
					file.data = new Buffer(file.data.toString().toUpperCase())
					yield Promise.resolve()
				}).target(tar)

				const arr = yield f.$.expand(`${tar}/*.txt`)
				t.equal(arr.length, 2, "place files in target destination after `inline` method (every:1)")
				const str1 = yield f.$.read(`${tar}/foo.txt`, "utf8")
				const str2 = yield f.$.read(`${tar}/bar.txt`, "utf8")
				t.equal(str1, "FOO BAR\n", "capitalize file contents individually")
				t.equal(str2, "BAR BAZ\n", "capitalize file contents individually")
				yield del(tar)
			},
			*bar(f) {
				const tar = join(fixtures, ".tmp2")
				yield f.source(src).run({ every: 0 }, function * (files) {
					t.true(Array.isArray(files), "customizes inline plugin behavior")
					t.equal(files.length, 2, "receives array of ALL current files (every:0)")
				}).target(tar)

				const arr = yield f.$.expand(`${tar}/*.txt`)
				t.equal(arr.length, 2, "place files in target destination after `inline` method (every:0)")
				yield del(tar)
			}
		}
	})

	yield taskr.parallel(["foo", "bar"])
}))

test("task.run (w/object)", co(function * (t) {
	t.plan(10)
	const src = join(fixtures, "*.txt")

	const taskr = new Taskr({
		tasks: {
			*foo(f) {
				const tar = join(fixtures, ".tmp3")

				yield f.source(src).run({
					*func(file) {
						t.true($.isObject(file), "iterates thru each `file` (default)")
						t.true(file.hasOwnProperty("data"), "receives entire `file` object")
						file.data = new Buffer(file.data.toString().toUpperCase())
						yield Promise.resolve()
					}
				}).target(tar)

				const arr = yield f.$.expand(`${tar}/*.txt`)
				t.equal(arr.length, 2, "place files in target destination after `inline` method (every:1)")
				const str1 = yield f.$.read(`${tar}/foo.txt`, "utf8")
				const str2 = yield f.$.read(`${tar}/bar.txt`, "utf8")
				t.equal(str1, "FOO BAR\n", "capitalize file contents individually")
				t.equal(str2, "BAR BAZ\n", "capitalize file contents individually")
				yield del(tar)
			},
			*bar(f) {
				const tar = join(fixtures, ".tmp4")

				yield f.source(src).run({
					every: 0,
					*func(files) {
						t.true(Array.isArray(files), "customizes inline plugin behavior")
						t.equal(files.length, 2, "receives array of ALL current files (every:0)")
					}
				}).target(tar)

				const arr = yield f.$.expand(`${tar}/*.txt`)
				t.equal(arr.length, 2, "place files in target destination after `inline` method (every:0)")
				yield del(tar)
			}
		}
	})

	yield taskr.parallel(["foo", "bar"])
}))

test("task.exec", co(function * (t) {
	t.plan(4)
	const ctx = new Taskr()
	const task = new Task(ctx)

	const obj1 = { foo: "bar" }
	const obj2 = { baz: "bat" }
	// mock task function, pre-wrapped
	const mock = co(function * (f, o) {
		t.true(f instanceof Task, "receives current Task instance as parameter")
		t.deepEqual(f._, obj2, "sets internal `task._` object during exchange")
		t.true(this instanceof Task, "binds `this` context to Task instance")
		t.deepEqual(o, obj1, "receives custom set of options")
		return this
	})

	yield task.exec(mock, obj1, obj2)
}))
