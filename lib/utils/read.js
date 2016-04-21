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
	_('read this file: %s', filepath)

	return new Promise(function (res, rej) {
		fs.stat(filepath, function (err, stats) {
			if (err) {
				return rej(err)
			}

			// send `null` if is a directory
			if (!stats.isFile()) {
				return res(null)
			}

			fs.readFile(filepath, function (err, data) {
				if (err) {
					return rej(err)
				}
				return res(data)
			})
		})
	})
}
