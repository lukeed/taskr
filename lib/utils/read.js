'use strict';

var readPkg = require('read-pkg');
var debug = require('debug');
var _ = debug('fly:read');

/**
 * Read a file and return its normalized contents
 * @param {String}   filepath      The file at filepath to read
 * @return {Promise}   						 The Promise that will resolve to file's contents
 */
module.exports = function (filepath) {
	_('read this file: %f', filepath);
	return readPkg(filepath);
};
