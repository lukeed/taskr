'use strict';

var Fly = require('../fly');
var utils = require('../utils');
var loadPlugins = require('../loadPlugins');

/**
 * Create a new Fly instance
 * @param {String} flypath 		 	The path to a Flyfile
 * @param {Function} hook       The method to attach flyfile to instance
 * @return {Fly} 								The new Fly instance
 */
module.exports = function * (flypath, hook) {
	hook = hook || utils.bind;

	// find given `flyfile.js`
	var flyfile = yield utils.find(flypath, hook);

	return new Fly({
		file: flyfile,
		host: require(flyfile),
		plugins: loadPlugins(flyfile, hook) // find & `require()`
	});
};
