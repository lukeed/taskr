'use strict';

const p = require('path');
const $ = require('./utils');
const flatten = require('flatten');
const Promise = require('bluebird');

const co = Promise.coroutine;
const dirname = p.dirname;
const join = p.join;

const rgx = /^fly-/i;

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
	if (!file || !(yield $.find(file))) {
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

	// get ALL deps; filter down to fly-only;
	const deps = yield getDependencies(pkg).filter(dep => rgx.test(dep));
	const hasNext = deps.indexOf('fly-esnext');

	// if 'fly-esnext' remove from `deps`
	if (hasNext !== -1) {
		deps.splice(hasNext, 1);
	}

	// format return;
	return deps.map(str => ({
		name: str,
		func: req(join(modules, str))
	}));
});

module.exports = {
	load: load,
	getDependencies: getDependencies
};
