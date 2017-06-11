"use strict"

const fs = require("fs")
const path = require("path")
const Promise = require("bluebird")
const co = Promise.coroutine
const readdir = Promise.promisify(fs.readdir)

/**
 * Search for a file in the parent directories.
 * @param {String} file  The filename to find.
 * @param {String} dir   The directory to begin searching within.
 * @yield {String}       The directory's full path.
 */
const findup = module.exports = co(function* (file, dir) {
	const files = (yield readdir(dir)).filter(f => file === f)

  if (files.length === 0 && dir === '/') {
    throw new Error('Unable to find ' + file)
  }

  return files.length === 1 ? dir : yield findup(file, path.dirname(dir))
})