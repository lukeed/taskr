'use strict'

var writer = require('fs').writeFile
var debug = require('debug')
var _ = debug('fly:write')
var co = require('co')

/**
 * Write a file with data
 * @param {String}   filepath      The file at filepath to read
 * @param {String}   filedata      The data to write.
 * @return {Promise}               The Promise
 */
module.exports = function (filepath, filedata) {
	_('write this file: %s', filepath)
	return co.wrap(writer)(filepath, filedata)
}
