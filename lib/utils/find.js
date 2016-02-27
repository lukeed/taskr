'use strict';

var findUp = require('find-up');
var debug = require('debug');
var _ = debug('fly:find');

/**
 * Find a file from a given path
 * @param {String}   filename      The filename to find
 * @param {String}   dir 			     The directory to begin searching within
 * @return {String}   						 The path to the Flyfile
 */
module.exports = function (filename, dir) {
	_('find this file: %f', filename);
	var opts = dir ? {cwd: dir} : {};
	return findUp.sync(filename, opts);
};
