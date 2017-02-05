"use strict"

const Promise = require("bluebird")
const co = Promise.coroutine

module.exports = function (opts, func) {
	// assign against defaults
	opts = Object.assign({every: 1, files: 1}, opts)
	func = opts.func || func

	return co(function * (o) {
		o = o || {}
		const args = []
		args.push.apply(args, arguments) && args.shift()
		// grab alias to chosen source type
		const arr = this._[opts.files ? "files" : "globs"]
		// wrapper pass all arguments to plugin func
		const run = s => co(func).apply(this, [s, o].concat(args))
		// loop thru EACH if `every`, else send full source array
		yield (opts.every ? Promise.all(arr.map(run)) : run(arr))
		// send back instance allow chain
		return this
	})
}
