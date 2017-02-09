"use strict"

const p = require("path")
const Promise = require("bluebird")
const write = Promise.promisify(require("fs").writeFile)
const mkdirp = Promise.promisify(require("mkdirp"))
const normalize = p.normalize
const dirname = p.dirname

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 * @param {String} file  The full file"s path.
 * @param {String} data  The data to write.
 * @param {Object} opts  See `fs.writeFile`.
 */
module.exports = Promise.coroutine(function * (file, data, opts) {
	try {
		file = normalize(file)
		yield mkdirp(dirname(file))
		yield write(file, data, opts)
	} catch (_) {}
})
