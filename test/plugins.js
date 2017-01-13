"use strict"

const Promise = require("bluebird")
const join = require("path").join
const test = require("tape")

const del = require("./helpers")
const plugs = require("../lib/plugins")
const cli = require("../lib/cli")
const $ = require("../lib/fn")
const Fly = require("../lib")

const co = Promise.coroutine

const fixtures = join(__dirname, "fixtures")
const altDir = join(fixtures, "alt")
const pkgfile = join(altDir, "package.json")
const flyfile = join(altDir, "flyfile.js")

test("plugins", t => {
	t.ok(Object.keys(plugs).length, "export some methods")
	const methods = ["wrapper", "load", "getDependencies", "getPackage"]
	methods.forEach(k => t.ok(plugs[k] !== undefined, `${k} is defined`))
	t.end()
})

test("plugins.wrapper", co(function* (t) {
	const fly = new Fly()
	const func = function* () { }
	const out = plugs.wrapper.apply(fly, [{}, func])
	// kind of useless test, oh well
	t.equal(typeof out, "function", "returns a function")
	t.notEqual(out, func, "is not the original function")
	t.end()
}))

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
	t.equal(out2.file, pkgfile, "read `fly.pkg` config to find alternate `package.json` file")

	t.end()
}))

test("plugins.getDependencies", co(function* (t) {
	const out1 = plugs.getDependencies()
	t.true(Array.isArray(out1) && out1.length === 0, "via `null` input returns an empty array")

	const pkg = yield plugs.getPackage(pkgfile)
	const out2 = plugs.getDependencies(pkg.data)
	t.true(Array.isArray(out2), "via valid file returns an array")
	t.equal(out2.length, 5, "via valid file find all the available dependencies")

	const out3 = plugs.getDependencies({})
	t.true(Array.isArray(out3) && out3.length === 0, "via `{}` returns an empty array")

	t.end()
}))

test("plugins.load", co(function* (t) {
	// const out1 = yield plugs.load(join("/fake123", "flyfile.js"))
	// t.true(Array.isArray(out1) && out1.length === 0, "via invalid file returns an empty array")
	// ^^ logs error message to test disrupts formatting

	const out = yield plugs.load(flyfile)
	t.ok(Array.isArray(out), "returns an array")
	t.equal(out.length, 4, "filters down to fly-* plugins only")
	t.ok($.isObject(out[0]), "is an array of objects")
	t.ok("name" in out[0] && "func" in out[0], "objects contain `name` and `func` keys")
	t.equal(out[2].func, undefined, "return `undefined` for faulty plugins")

	t.end()
}))

test("fly.plugins", co(function* (t) {
	const fly = yield cli.spawn(altDir)

	const ext = "*.txt"
	const src = join(fixtures, ext)
	const tar = join(fixtures, ".tmp")

	fly.tasks = {
		* a(f) {
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
		},
		* b(f) {
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
		}
	}

	yield fly.serial(["a", "b"])

	t.end()
}))

test("fly.plugins' parameters", co(function* (t) {
	t.plan(15)

	const ext = "*.txt"
	const src = join(fixtures, ext)
	const tar = join(fixtures, ".tmp")

	const fly = new Fly({
		plugins: [{
			func() {
				this.plugin("p0", {}, function* (one) {
					// x2 bcuz 2 files
					t.true($.isObject(one), "1st param is a `file` object (`every: 1`)")
				})
			}
		}, {
			func() {
				this.plugin("p1", { every: 0 }, function* (one, two, thr) {
					t.true(Array.isArray(one), "1st param is a `files` array (`every: 0`)")
					t.deepEqual(two, {}, "2nd param defaults to empty object")
					t.equal(thr, undefined, "3rd param defaults as undefined")
				})
			}
		}, {
			func() {
				this.plugin("p2", { every: 0 }, function* (_, two, thr) {
					t.equal(two, "hi", "2nd param can be a `string`")
					t.equal(thr, undefined, "3rd param remains undefined")
				})
			}
		}, {
			func() {
				this.plugin("p3", { every: 0 }, function* (_, two, thr) {
					t.deepEqual(two, ["hi"], "2nd param can be an `array`")
					t.equal(thr, undefined, "3rd param remains undefined")
				})
			}
		}, {
			func() {
				this.plugin("p4", { every: 0 }, function* (_, two, thr) {
					t.deepEqual(two, { a: "hi" }, "2nd param can be a custom `object`")
					t.equal(thr, undefined, "3rd param remains undefined")
				})
			}
		}, {
			func() {
				this.plugin("p5", { every: 0 }, function* (_, two, thr) {
					t.deepEqual(thr, { a: "hi" }, "3rd param can be assigned")
					t.equal(two, "hello", "2nd param also assigned")
				})
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

	t.true("p0" in fly, "attach first custom plugin (`p0`) to fly")
	t.true("p5" in fly, "attach first custom plugin (`p0`) to fly")

	yield fly.start("a")
}))
