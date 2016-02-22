'use strict';

var path = require('path');
var jsVars = require('interpret').jsVariants;
var globby = require('globby');
var debug = require('debug');
var _ = debug('fly:find');
// promisify `fs` methods
var thenify = require('thenify-all');
var fs = thenify(require('fs'), {}, ['stat']);

/**
 * Find a valid Flyfile from a given path
 * @param {String}   filepath      The file or path to a Flyfile
 * @param {Function} bind          The function to bind, require, or process `filepath`
 * @return {String}   						 The path to the Flyfile
 */
module.exports = function * (filepath, bind) {
	bind = bind || function (_) {
		return _;
	};

	_('resolve path to flyfile %o', filepath);

	var froot = path.join(process.cwd(), filepath);
	var stats = yield fs.stat(filepath);

	if (stats.isDirectory()) {
		var glob = fileOptions();
		froot = yield globby(froot + path.sep + glob);
		froot = froot[0];
	}

	return froot;
};

/**
 * Format a Glob string for possible flyfile matching
 * @return {String}
 */
function fileOptions() {
	var extns = Object.keys(jsVars).map(function (ext) {
		return ext.substr(1); // remove leading '.'
	});
	var names = ['Flyfile', 'flyfile'];

	return [names, extns].map(function (obj) {
		return '{' + obj.join(',') + '}';
	}).join('.');
}
