'use strict';

var flatten = require('flatten');
var debug = require('debug');
var _ = debug('fly:filter');

/**
	Filter fly-* plugins from a package dependencies.
	@param {Object} package.json
	@param {Function} load handler
	@param {[String]} blacklisted plugins
	@return {[String]} list of fly plugins
*/

// @todo: use `pkg-dir` & `read-pkg` libs
module.exports = function (pkg, load, blacklist) {
	blacklist = blacklist || [];

	_('filter fly-* plugins');

	flatten();
	// return !pkg ? []
	// 	: flatten(['dependencies', 'devDependencies', 'peerDependencies']
	// 		.filter((key) => key in pkg)
	// 		.map((dep) => Object.keys(pkg[dep])))
	// 		.filter((dep) => /^fly-[-\w]+/g.test(dep))
	// 		.filter((dep) => !~['fly-util'].concat(blacklist).indexOf(dep))
	// 		.reduce((prev, next) => prev.concat(load(next)), []);
};
