"use strict"

const fs = require("fs")
const Promise = require("bluebird")
const stat = Promise.promisify(fs.stat)
const read = Promise.promisify(fs.readFile)
const co = Promise.coroutine

/**
 * Return a file's contents. Will not read directory!
 * @param {String}        file  The file's path.
 * @param {Object|String} opts  See `fs.readFile`.
 * @yield {Buffer|String}
 */
module.exports = co(function * (file, opts) {
	const s = yield stat(file)
	return s.isFile() ? yield read(file, opts) : null
})
