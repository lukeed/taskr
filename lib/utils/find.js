'use strict';

var co = require('bluebird').coroutine;
var find = require('find-up');

/**
 * Find a file from a given path
 * @param {String}  file  The filename to find.
 * @param {String}  dir   The directory to begin searching within.
 * @return {String}       The filepath or `null`.
 */
module.exports = co(function * (file, dir) {
	return yield find(file, dir ? {cwd: dir} : {});
});
