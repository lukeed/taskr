'use strict';

const Promise = require('bluebird');
const dirname = require('path').dirname;
const mkdirp = Promise.promisify(require('mkdirp'));
const write = Promise.promisify(require('fs').writeFile);
const co = Promise.coroutine;

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 * @param {String} file  The full file's path.
 * @param {String} data  The data to write.
 */
module.exports = co(function * (file, data) {
	yield mkdirp(dirname(file));
	yield write(file, data);
});
