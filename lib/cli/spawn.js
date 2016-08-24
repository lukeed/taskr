'use strict'

const Fly = require('../fly')
const utils = require('../utils')
const loadPlugins = require('../plugins').load

/**
 * Create a new Fly instance
 * @param {String} dir          The directory to find a `flyfile.js`
 * @return {Fly}                The new Fly instance
 */
module.exports = function * (dir) {
	var flyfile = yield utils.find('flyfile.js', dir)

	if (!flyfile) {
		return new Fly();
	}

	// find & `require()`. will load `fly-esnext` before spawning

	return new Fly({
		file: flyfile,
		plugins: yield loadPlugins(flyfile)
	})
}
