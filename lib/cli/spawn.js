'use strict'

var Fly = require('../fly')
var utils = require('../utils')
var loadPlugins = require('../plugins').load

/**
 * Create a new Fly instance
 * @param {String} dir          The directory to find a `flyfile.js`
 * @param {Function} hook       The method to attach flyfile to instance
 * @return {Fly}                The new Fly instance
 */
module.exports = function * (dir, hook) {
	hook = hook || utils.bind

	var flyfile = yield utils.find('flyfile.js', dir)
	// find & `require()`. will load `fly-esnext` before spawning
	var plugins = yield loadPlugins(flyfile, hook)

	return new Fly({
		file: flyfile,
		host: require(flyfile),
		plugins: plugins
	})
}
