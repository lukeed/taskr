'use strict';

const p = require('path');
const flatten = require('flatten');
const Promise = require('bluebird');
const $ = require('./utils');
const fn = require('./fn');

const co = Promise.coroutine;
const dirname = p.dirname;
const join = p.join;

const isObj = fn.isObject;
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
 * @param  {Object} file  A `package.json` contents as JSON
 * @return {Array}        The names of all dependencies, flattened
 */
function getDependencies(pkg) {
	if (!pkg) {
		return [];
	}

	if (!isObj(pkg)) {
		$.error('Content from `package.json` must be an `Object`!');
		return [];
	}

	// get all possible dependencies
	const deps = ['dependencies', 'devDependencies', 'peerDependencies']
		.filter(key => key in pkg).map(dep => Object.keys(pkg[dep]));

	return flatten(deps);
}

/**
 * Find & Read a `package.json` file, starting from `dir`.
 * @param {String} dir
 * @yield {Object}      If found, returns as `{file, data}`
 */
const getPackage = co(function * (dir) {
	// traverse upwards from `dir`
	const file = yield $.find('package.json', dir);

	if (!file) {
		return false;
	}

	// check if there's a "fly" config entry
	const data = JSON.parse(yield $.read(file));

	if (data.fly && data.fly.pkg) {
		dir = p.resolve(dir, data.fly.pkg);
		return yield getPackage(dir);
	}

	return {file: file, data: data};
});

/**
 * Loads all fly-related plugins!
 * @param  {String} flyfile  The full `flyfile.js` path
 * @return {Array}           All loaded plugins.
 */
const load = co(function * (flyfile) {
	// find a `package.json`, starting with `flyfile` dir
	const pkg = yield getPackage(dirname(flyfile));

	if (!pkg) {
		$.error('No `package.json` found!');
		return [];
	}

	// get ALL deps; filter down to fly-only;
	const deps = getDependencies(pkg.data).filter(dep => rgx.test(dep));
	const hasNext = deps.indexOf('fly-esnext');

	// if 'fly-esnext' remove from `deps`
	if (hasNext !== -1) {
		deps.splice(hasNext, 1);
	}

	const modules = join(dirname(pkg.file), 'node_modules');

	// format return;
	return deps.map(str => ({
		name: str,
		func: req(join(modules, str))
	}));
});

module.exports = {
	load: load,
	getPackage: getPackage,
	getDependencies: getDependencies
};
