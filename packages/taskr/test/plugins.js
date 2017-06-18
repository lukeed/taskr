"use strict"

const Promise = require("bluebird")
const join = require("path").join
const test = require("tape")

const del = require("./helpers").del
const plugs = require("../lib/plugins")
const Taskr = require("../lib/taskr")
const cli = require("../lib/cli")
const $ = require("../lib/fn")

const co = Promise.coroutine

const fixtures = join(__dirname, "fixtures")
const altDir = join(fixtures, "alt")
const pkgfile = join(altDir, "package.json")
const taskfile = join(altDir, "taskfile.js")

test("plugins", t => {
	t.ok(Object.keys(plugs).length, "export some methods")
	const methods = ["load", "getDependencies", "getPackage"]
	methods.forEach(k => t.ok(plugs[k] !== undefined, `${k} is defined`))
	t.end()
})

test("plugins.getPackage", co(function* (t) {
	const out1 = yield plugs.getPackage(altDir)
	t.true($.isObject(out1), "returns an object")
	t.true("file" in out1 && "data" in out1, "object has `file` and `data` keys")
	t.equal(out1.file, pkgfile, "finds the correct `package.json` file")
	t.true($.isObject(out1.data), "the `object.data` is also an object")
	t.true("dependencies" in out1.data, "the `object.data` contains all `package.json` contents")

	// "fly" > "pkg" tests
	const subDir = join(altDir, "sub")
	const out2 = yield plugs.getPackage(subDir)
	t.equal(out2.file, pkgfile, "read `taskr.pkg` config to find alternate `package.json` file")

	t.end()
}))

test("plugins.getDependencies", co(function* (t) {
	const out1 = plugs.getDependencies()
	t.true(Array.isArray(out1) && out1.length === 0, "via `null`; input returns an empty array")

	const pkg = yield plugs.getPackage(altDir)
	const out2 = plugs.getDependencies(pkg.data)
	t.true(Array.isArray(out2), "via dir; returns an array")
	t.equal(out2.length, 9, "via dir; find all the available dependencies")

	const out3 = plugs.getDependencies({})
	t.true(Array.isArray(out3) && out3.length === 0, "via `{}`; returns an empty array")

	t.end()
}))

test("plugins.load", co(function* (t) {
	// const out1 = yield plugs.load(join("/fake123", "taskfile.js"))
	// t.true(Array.isArray(out1) && out1.length === 0, "via invalid file returns an empty array")
	// ^^ logs error message to test disrupts formatting

	const out = yield plugs.load(taskfile)
	t.ok(Array.isArray(out), "returns an array")
	t.equal(out.length, 7, "filters down to fly|taskr plugins only")
	t.equal(typeof out[0], "function", "is an array of functions")
	t.equal(out[2], undefined, "returns `undefined` for faulty plugins")

	t.end()
}))

test("Taskr.plugins (auto-load)", co(function* (t) {
	t.plan(7)
	const taskr = yield cli.spawn(altDir)

	const ext = "*.txt"
	const src = join(fixtures, ext)
	const tar = join(fixtures, ".tmp")

	taskr.tasks = {
		a: {
			data: {},
			func: co(function * (f) {
				yield f.source(src).plugOne().target(tar)

				const out = yield Promise.all(
					[join(tar, "foo.txt"), join(tar, "bar.txt")].map(s => f.$.read(s))
				)

				out.forEach((buf, idx) => {
					if (idx === 0) {
						t.equal(buf.toString(), `\nrab oof`, "reverse `foo.txt` content")
					} else {
						t.equal(buf.toString(), `\nzab rab`, "reverse `bar.txt` content")
					}
				})

				yield del(tar)
			})
		},
		b: {
			data: {},
			func: co(function * (f) {
				yield f.source(src).plugOne().plugTwo().target(tar)
				t.pass("custom plugins are chainable")

				const out = yield Promise.all(
					[join(tar, "foo.txt"), join(tar, "bar.txt")].map(s => f.$.read(s))
				)

				out.forEach((buf, idx) => {
					if (idx === 0) {
						t.equal(buf.toString(), `foo bar\n`, "double-reverse `foo.txt` content")
					} else {
						t.equal(buf.toString(), `bar baz\n`, "double-reverse `bar.txt` content")
					}
				})

				// relied on `plugOne` to finish first
				t.pass(`await previous plugin"s completion`)
				// handle `non-every` plugins
				t.pass("handle non-looping plugins (`{every: 0}`)")

				yield del(tar)
			})
		}
	}

	yield taskr.serial(["a", "b"])
}))

test("Taskr.plugins (params)", co(function* (t) {
	t.plan(15)

	const ext = "*.txt"
	const src = join(fixtures, ext)
	const tar = join(fixtures, ".tmp")
	const expect = ["p0", "p1", "p2", "p3", "p4", "p5"]

	const taskr = new Taskr({
		plugins: [{
			name: 'p0',
			*func(one) {
				// x2 bcuz 2 files
				t.true($.isObject(one), "1st param is a `file` object (`every: 1`)")
			}
		}, {
			every: 0,
			name: 'p1',
			*func(one, two, thr) {
				t.true(Array.isArray(one), "1st param is a `files` array (`every: 0`)")
				t.deepEqual(two, {}, "2nd param defaults to empty object")
				t.equal(thr, undefined, "3rd param defaults as undefined")
			}
		}, {
			every: 0,
			name: 'p2',
			*func(_, two, thr) {
				t.equal(two, "hi", "2nd param can be a `string`")
				t.equal(thr, undefined, "3rd param remains undefined")
			}
		}, {
			every: 0,
			name: 'p3',
			*func(_, two, thr) {
				t.deepEqual(two, ["hi"], "2nd param can be an `array`")
				t.equal(thr, undefined, "3rd param remains undefined")
			}
		}, {
			every: 0,
			name: 'p4',
			*func(_, two, thr) {
				t.deepEqual(two, { a: "hi" }, "2nd param can be a custom `object`")
				t.equal(thr, undefined, "3rd param remains undefined")
			}
		}, {
			every: 0,
			name: 'p5',
			*func(_, two, thr) {
				t.deepEqual(thr, { a: "hi" }, "3rd param can be assigned")
				t.equal(two, "hello", "2nd param also assigned")
			}
		}],
		tasks: {
			* a(f) {
				yield f.source(src).p0().target(tar)
				yield f.source(src).p1().target(tar)
				yield f.source(src).p2("hi").target(tar)
				yield f.source(src).p3(["hi"]).target(tar)
				yield f.source(src).p4({ a: "hi" }).target(tar)
				yield f.source(src).p5("hello", { a: "hi" }).target(tar)
				yield del(tar)
			}
		}
	})

	t.deepEqual(taskr.plugNames, expect, "store all custom plugin names")
	t.equal(Object.keys(taskr.plugins).length, expect.length, "attach all plugin methods")

	yield taskr.start("a")
}))

test("Taskr.plugin (export fn params)", co(function * (t) {
	t.plan(3)
	const taskr = yield cli.spawn(altDir)

	taskr.tasks = {
		foo: {
			data: [],
			func: co(function * (f) {
				yield f.localPlugin({ t })
			})
		}
	}

	yield taskr.start("foo")
}))
