'use strict';

const p = require('path');
const flatten = require('./fn').flatten;
const isObject = require('./fn').isObject;
const co = require('bluebird').coroutine;
const $ = require('./utils');

const rgx = /^@(taskr|fly)|(taskr|fly)-/i;
const dirname = p.dirname;
const resolve = p.resolve;
const join = p.join;

/**
 * Attempt to dynamically `require()` a file or package
 * @param  {String} name 	The dep-name or filepath to require.
 * @param  {String} base 	Path to `node_modules` directory.
 */
function req(name, base) {
	try {
		try {
			name = require.resolve(name);
		} catch (_) {
			name = join(base, name);
		} finally {
			return require(name);
		}
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

	if (!isObject(pkg)) {
		$.error('Content from `package.json` must be an `Object`!');
		return [];
	}

	// get all possible dependencies
	const deps = [
		'dependencies', 'devDependencies', 'peerDependencies'
	].filter(key => pkg[key] !== void 0).map(k => Object.keys(pkg[k]));

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

	// check if there's a 'taskr' config entry
	const data = JSON.parse(yield $.read(file));

	if (data.taskr && data.taskr.pkg) {
		dir = resolve(dir, data.taskr.pkg);
		return yield getPackage(dir);
	}

	return { file, data };
});

/**
 * Loads all (fly|taskr)-related plugins!
 * @param  {String} taskfile  The full `taskfile.js` path
 * @return {Array}           All loaded plugins.
 */
const load = co(function * (taskfile) {
	// find a `package.json`, starting with `taskfile` dir
	const pkg = yield getPackage(dirname(taskfile));

	if (!pkg) {
		$.error('No `package.json` found!');
		return [];
	}

	// get ALL deps filter down to (taskr|fly)-only
	const deps = getDependencies(pkg.data).filter(dep => rgx.test(dep));
	const locals = pkg.data.taskr && pkg.data.taskr.requires;
	const hasNext = deps.indexOf('@taskr/esnext');

	if (locals) {
		let i = 0;
		const len = locals.length;
		const pkgDir = dirname(pkg.file);
		for (; i < len; i++) {
			deps.push(join(pkgDir, locals[i]));
		}
	}

	// if '@taskr/esnext' remove from `deps`
	if (hasNext !== -1) {
		deps.splice(hasNext, 1);
	}

	const modules = join(dirname(pkg.file), 'node_modules');

	// format return
	return deps.map(str => req(str, modules));
});

module.exports = {
	load,
	getPackage,
	getDependencies
};
