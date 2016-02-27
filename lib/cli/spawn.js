'use strict';

var Fly = require('../fly');
var utils = require('../utils');
var loadPlugins = require('../plugins').load;

/**
 * Create a new Fly instance
 * @param {String} dir 		 			The directory to find a `flyfile.js`
 * @param {Function} hook       The method to attach flyfile to instance
 * @return {Fly} 								The new Fly instance
 */
module.exports = function * (dir, hook) {
	hook = hook || utils.bind;

	var flyfile = utils.find('flyfile.js', dir);

	return new Fly({
		file: flyfile,
		host: require(flyfile),
		plugins: loadPlugins(flyfile, hook) // find & `require()`
	});
};
