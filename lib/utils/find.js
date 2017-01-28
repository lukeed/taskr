"use strict"

const { resolve, normalize } = require("path")
const { promisify } = require("bluebird")
const glob = promisify(require("glob"))

/**
 * Find a file from a given path
 * @param {String} file  The filename to find.
 * @param {String} dir   The directory to begin searching within.
 * @yield {String}       The file"s full path or `null`.
 */
module.exports = function (file, dir) {
	return glob(resolve(dir || ".", file)).then(arr => arr.length ? normalize(arr[0]) : null)
}
