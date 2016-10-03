'use strict';

const p = require('path');
const $ = require('./utils');
const flatten = require('flatten');
const Promise = require('bluebird');

const co = Promise.coroutine;
const dirname = p.dirname;
const join = p.join;

const esnext = 'fly-esnext';
const rgx = /^fly-[-\w]+/g;

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
 * Find a sibling `package.json` file & return its contents.
 * @param  {String} file  The path to `package.json`
 * @return {Array}        The names of all dependencies, flattened
 */
const getDependencies = co(function * (file) {
	if (!file) {
		return [];
	}

	// parse file contents as Object
	const pkg = JSON.parse(yield $.read(file));

	// get all possible dependencies
	const deps = ['dependencies', 'devDependencies', 'peerDependencies']
		.filter(key => key in pkg)
		.map(dep => Object.keys(pkg[dep]));

	return flatten(deps);
});

/**
 * Loads all fly-related plugins!
 * @param  {String} flyfile  The full `flyfile.js` path
 * @return {Array}           All loaded plugins.
 */
const load = co(function * (flyfile) {
	// find `package.json` closes to `flyfile`
	const pkg = yield $.find('package.json', dirname(flyfile));

	if (!pkg) {
		$.error('No `package.json` found!');
		return [];
	}

	const modules = join(dirname(pkg), 'node_modules');

	// get ALL deps; filter down to fly-only; format return;
	return yield getDependencies(pkg)
		.filter(dep => rgx.test(dep))
		.map(str => ({
			name: str,
			plugin: req(join(modules, str))
		}));
});

module.exports = {
	load: load,
	getDependencies: getDependencies
};
