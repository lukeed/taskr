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

function wrapper(opts, func) {
	// assign `opts` against defaults
	opts = Object.assign({every: 1, files: 1}, opts);

	// update callback reference
	func = co(func.bind(this));

	return co(function * () {
		let args = [].slice.call(arguments);
		(!args.length) && (args = {});

		// grab alias to chosen source type
		const arr = this._[opts.files ? 'files' : 'globs'];

		// wrapper; pass all arguments to plugin func
		const run = s => func.apply(this, [s].concat(args));

		// loop thru EACH if `every`, else send full source array
		yield (opts.every ? Promise.all(arr.map(run)) : run(arr));

		// send back instance; allow chain
		return this;
	}.bind(this));
}

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
	const locals = pkg.data.fly && pkg.data.fly.requires;
	const hasNext = deps.indexOf('fly-esnext');

	if (locals) {
		const pkgDir = dirname(pkg.file);
		for (const l of locals) {
			deps.push(join(pkgDir, l));
		}
	}

	// if 'fly-esnext' remove from `deps`
	if (hasNext !== -1) {
		deps.splice(hasNext, 1);
	}

	const modules = join(dirname(pkg.file), 'node_modules');

	// format return;
	return deps.map(str => ({
		name: str,
		func: req(str, modules)
	}));
});

module.exports = {
	load: load,
	wrapper: wrapper,
	getPackage: getPackage,
	getDependencies: getDependencies
};
