'use strict';

const co = require('bluebird').coroutine;
const load = require('../plugins').load;
const find = require('../utils/find');
const Fly = require('../');

/**
 * Create a new Fly instance
 * @param {String} dir   The directory to find a `flyfile.js`
 * @return {Fly}         The new Fly instance
 */
module.exports = co(function * (dir) {
	const file = yield find('flyfile.js', dir);

	if (!file) {
		return new Fly();
	}

	return new Fly({
		pwd: dir,
		file: file,
		// find & `require()`. will load `fly-esnext` before spawning
		plugins: yield load(file)
	});
});
