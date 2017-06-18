"use strict"

const co = require("bluebird").coroutine
const load = require("../plugins").load
const find = require("../utils/find")
const read = require("../utils/read")
const Taskr = require("../taskr")

/**
 * Create a new Taskr instance
 * @param {String} cwd   The directory to find a `taskfile.js`
 * @return {Taskr}         The new Taskr instance
 */
module.exports = co(function * (cwd) {
	const file = yield find("taskfile.js", cwd)

	if (!file) {
		return new Taskr()
	}

	// find & `require()`. will load `@taskr/esnext` before spawning
	const plugins = yield load(file)

	// spawn options
	const opts = {cwd, file, plugins}

	try {
		const esnext = require("@taskr/esnext")
		if (esnext) {
			const data = yield read(file, "utf8")
			opts.tasks = esnext(file, data)
		}
	} catch (err) {}

	return new Taskr(opts)
})
