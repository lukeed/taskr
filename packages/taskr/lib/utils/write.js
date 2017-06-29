'use strict';

const p = require('path');
const mkdir = require('mk-dirs');
const Promise = require('bluebird');
const write = Promise.promisify(require('fs').writeFile);

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 * @param {String} file  The full file's path.
 * @param {String} data  The data to write.
 * @param {Object} opts  See `fs.writeFile`.
 */
module.exports = Promise.coroutine(function * (file, data, opts) {
	try {
		file = p.normalize(file);
		yield mkdir(p.dirname(file));
		yield write(file, data, opts);
	} catch (_) {}
});
