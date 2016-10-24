'use strict';

const co = require('bluebird').coroutine;
const load = require('../plugins').load;
const find = require('../utils/find');
const read = require('../utils/read');
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

	// spawn options
	const opts = {
		pwd: dir,
		file: file,
		// find & `require()`. will load `fly-esnext` before spawning
		plugins: yield load(file)
	};

	try {
		const esnext = require.resolve('fly-esnext') && require('fly-esnext');
		if (esnext) {
			const data = yield read(file, 'utf8');
			opts.tasks = esnext(file, data);
		}
	} catch (e) {}

	return new Fly(opts);
});
