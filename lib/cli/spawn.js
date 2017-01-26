"use strict"

const co = require("bluebird").coroutine
const load = require("../plugins").load
const find = require("../utils/find")
const read = require("../utils/read")
const Fly = require("../fly")

/**
 * Create a new Fly instance
 * @param {String} cwd   The directory to find a `flyfile.js`
 * @return {Fly}         The new Fly instance
 */
module.exports = co(function * (cwd) {
	const file = yield find("flyfile.js", cwd)

	if (!file) {
		return new Fly()
	}

	// find & `require()`. will load `fly-esnext` before spawning
	const plugins = yield load(file)

	// spawn options
	const opts = {cwd, file, plugins}

	try {
		const esnext = require("fly-esnext")
		if (esnext) {
			const data = yield read(file, "utf8")
			opts.tasks = esnext(file, data)
		}
	} catch (err) {}

	return new Fly(opts)
})
