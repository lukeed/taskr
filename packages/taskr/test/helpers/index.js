"use strict"

const bb = require("bluebird")
const stat = bb.promisify(require("fs").stat)
const rimraf = bb.promisify(require("rimraf"))
const toArray = require("../../lib/fn").toArray

/**
 * `@taskr/clear` stub
 * serves as test-util only
 */
exports.del = bb.coroutine(function * (src) {
	yield bb.all(toArray(src).map(g => rimraf(g)))
})

/**
 * Check if a File has given rights
 * @param {String} file  A file path
 * @param {Number} mode  A desired permission.
 * @return {Boolean}
 */
exports.isMode = bb.coroutine(function * (file, mode) {
	if (process.platform === "win32") {
		return true
	}
	const info = yield stat(file)
	return info.isFile() ? Number((info.mode & 0o777).toString(8)) === mode : false
})
