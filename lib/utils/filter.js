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

	if (!pkg) {
		return [];
	}

	// all installed packages!
	var deps = ['dependencies', 'devDependencies', 'peerDependencies']
		.filter(function (key) {
			return key in pkg;
		}).map(function (dep) {
			return Object.keys(pkg[dep]);
		});

	return flatten(deps).filter(function (dep) {
		// filter down to `fly-` related deps only & ensure not part of `blacklist`
		return /^fly-[-\w]+/g.test(dep) && blacklist.indexOf(dep) === -1;
	}).reduce(function (prev, next) {
		return prev.concat(load(next));
	}, []);
};
