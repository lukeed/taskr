"use strict"

const { readFile, stat } = require("fs")
const { coroutine, promisify } = require("bluebird")
const read = promisify(readFile)
const stats = promisify(stat)

/**
 * Return a file's contents. Will not read directory!
 * @param {String}        file  The file's path.
 * @param {Object|String} opts  See `fs.readFile`.
 * @yield {Buffer|String}
 */
module.exports = coroutine(function * (file, opts) {
	const s = yield stats(file)
	return s.isFile() ? yield read(file, opts) : null
})
