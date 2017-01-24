const test = require("tape")
const wrapp = require("../lib/wrapp")

test("wrapp", t => {
	const fly = new Fly()
	const func = function * () { }
	const out = wrapp({}, func)
	// kind of useless test, oh well
	t.equal(typeof out, "function", "returns a function")
	t.notEqual(out, func, "is not the original function")
	t.end()
})
