"use strict"

const { dirname, normalize } = require("path")
const { coroutine, promisify } = require("bluebird")
const write = promisify(require("fs").writeFile)
const mkdirp = promisify(require("mkdirp"))

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 * @param {String} file  The full file"s path.
 * @param {String} data  The data to write.
 */
module.exports = coroutine(function * (file, data) {
	try {
		file = normalize(file)
		yield mkdirp(dirname(file))
		yield write(file, data)
	} catch (_) {}
})
