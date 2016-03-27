'use strict'

var debug = require('debug')
var _ = debug('fly:read')
var fs = require('fs')

/**
 * Read a file and return its normalized contents
 * @param {String}   filepath      The file at filepath to read
 * @return {Promise}               The Promise that will resolve to file's contents
 */
module.exports = function (filepath) {
	_('read this file: %f', filepath)

	return new Promise(function (res, rej) {
		// send `null` if is a directory
		if (!fs.statSync(filepath).isFile()) {
			return res(null)
		}

		fs.readFile(filepath, function (err, data) {
			if (err) {
				return rej(err)
			}

			return res(data)
		})
	})
}
