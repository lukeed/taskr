const test = require("tape")
const wrapp = require("../lib/wrapp")
const co = require("bluebird").coroutine

test("wrapp", co(function * (t) {
	t.plan(11)
	const globs = ['baz']
	const files = ['foo', 'bar']
	const ctx = {_: {files, globs}}

	const foo = function * (src, opt) {
		t.true(files.indexOf(src) > -1, "loops each file entry by default")
		t.equal(opt, "hi", "can also receive options")
	}

	const bar = function * (src) {
		t.deepEqual(src, globs, "receive all globs; no loop")
	}

	const wrapped = wrapp({}, foo)

	t.equal(typeof wrapped, "function", "returns a function")
	t.notEqual(wrapped, foo, "is not the original function")

	try {
		yield wrapped()
	} catch (err) {
		t.true(/Cannot read property/.test(err.toString()), "wrapped function is unbound")
	}

	// defaults
	const out1 = yield wrapped.apply(ctx, ['hi'])
	t.pass("does not throw if binds to context")
	t.deepEqual(out1, ctx, "returns the new context")

	// modified opts
	const out2 = yield wrapp({every: false, files: false}, bar).apply(ctx)
	t.deepEqual(out2, ctx, "returns the new context")
}))
