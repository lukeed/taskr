'use strict';

const Promise = require('bluebird');
const find = require('../utils/find');
const loadPlugins = require('../plugins').load
const Fly = require('../api');
const co = Promise.coroutine;

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
		file: file,
		// find & `require()`. will load `fly-esnext` before spawning
		plugins: yield loadPlugins(file)
	});
});
