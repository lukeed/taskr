"use strict"

const fs = require("fs")
const path = require("path")
const Promise = require("bluebird")
const co = Promise.coroutine

/**
 * Search for a file in the parent directories.
 * @param {String} file  The filename to find.
 * @param {String} dir   The directory to begin searching within.
 * @yield {String}       The directory's full path.
 */
module.exports = function findup(file, dir) {
	const files = fs.readdirSync(dir).filter(f => file === f)

  if (files.length === 0 && dir === "/") {
    return null
  }

  return files.length === 1 ? dir : findup(file, path.dirname(dir))
}