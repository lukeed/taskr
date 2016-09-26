'use strict';

const p = require('path');
const $ = require('./utils');
const flatten = require('flatten');
const Promise = require('bluebird');

const co = Promise.coroutine;
const dirname = p.dirname;
const join = p.join;

/**
 * Loads a flyfile's plugins.
 * @param  {String} flyfile  The full `flyfile.js` path
 * @return {Array}           All loaded plugins.
 */
const load = co(function * (flyfile) {
	// find `package.json` within the project
	const pkg = yield findPkg(dirname(flyfile));

	if (!pkg) {
		$.error('No package.json found!');
		return [];
	}

	const modules = join(dirname(pkg), 'node_modules');

	// then parse all fly plugins
	const deps = yield readPackages(pkg);
	// require them & format output
	return parse(deps).map(str => ({
		name: str,
		plugin: req(join(modules, str))
	}));
});

/**
 * Find a `package.json` starting in `dir`, traversing upwards
 * @param  {String} dir   The directory to begin searching
 * @return {String}       The `package.json` filepath
 */
const findPkg = co(function * (dir) {
	return yield $.find('package.json', dir);
});

/**
 * Find a sibling `package.json` file & return its contents.
 * @param  {String} pkg   The `package.json` file path to use
 * @return {Object}       The file's contents, or {}
 */
const readPackages = co(function * (pkg) {
	return pkg ? JSON.parse(yield $.read(pkg)) : {};
});

/**
 * Attempt to dynamically `require()` a file or package
 * @param  {String} name 	The dep-name or filepath to require.
 */
function req(name) {
	try {
		return require(name);
	} catch (e) {
		$.alert(e.message);
	}
}

/**
 * Parse `package.json` for a list of Fly-related plugins,
 * @param {Object}    pkg         The `package.json` contents
 * @param {Array}     blacklist   The plugins to NOT load
 * @return {Array}                Flattened (single) array of plugins
 */
function parse(pkg, blacklist) {
	const esnext = 'fly-esnext';

	if (!pkg) {
		return [];
	}

	blacklist = (blacklist || []).concat(esnext);

	// all declared dependencies
	const all = flatten(
		['dependencies', 'devDependencies', 'peerDependencies']
			.filter(key => key in pkg)
			.map(dep => Object.keys(pkg[dep]))
	);

	// check if `fly-esnext` is included
	if (all.indexOf(esnext) !== -1) {
		require(esnext);
	}

	// filter down to `fly-` related deps only & ensure NOT in `blacklist`
	return all.filter(dep => /^fly-[-\w]+/g.test(dep) && blacklist.indexOf(dep) === -1);
}

module.exports = {
	load: load,
	parse: parse,
	findPkg: findPkg,
	readPackages: readPackages
};
