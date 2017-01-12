"use strict"

const p = require("path")
const co = require("bluebird").coroutine
const find = require("find-up")

/**
 * Find a file from a given path
 * @param {String} file  The filename to find.
 * @param {String} dir   The directory to begin searching within.
 * @yield {String}       The file"s full path or `null`.
 */
module.exports = co(function * (file, dir) {
	file = p.normalize(file)

	if (!dir) {
		dir = p.dirname(file)
		file = p.basename(file)
	}

	return yield find(file, {cwd: dir})
})
