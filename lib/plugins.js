'use strict'

var path = require('path')
var debug = require('debug')
var utils = require('./utils')
var flatten = require('flatten')
var _ = debug('fly:plugins')

/**
 * Takes a `flyfile` then reads & load fly-related plugins.
 *
 * @param  {String} flyfile   The main `flyfile.js` path
 * @param  {Function} hook    The function to bind plugins to main Fly instance
 * @return {Array}            Array of existent & loaded plugins
 */
function load(flyfile, hook) {
	hook = hook || utils.bind
	// hook(null, {presets: ['es2015', 'stage-0'], only: [/fly-[-\w]+\/[-\w]+\./, /[fF]lyfile\.js/] })

	_('beginning to look for plugins')

	// find `package.json` within the project
	return findPkg(path.dirname(flyfile)).then(function (fp) {
		if (!fp) {
			utils.error('No package.json found!')
			return []
		}

		var modules = path.join(path.dirname(fp), 'node_modules')

		// then parse all fly plugins
		return readPackages(fp).then(function (pkg) {
			return parse(pkg).map(function (name) {
				return {
					name: name,
					plugin: req(path.join(modules, name))
				}
			})
		})
	})
}

/**
 * Find a project's `package.json` starting in `dir`, traversing upwards
 * @param  {String} dir   The directory to begin searching
 * @return {String}       The `package.json` filepath
 */
function findPkg(dir) {
	return utils.find('package.json', dir)
}

/**
 * Find a sibling `package.json` file & return its contents.
 * @param  {String} fp    The `package.json` file path to use
 * @return {Object}       The file's contents, or {}
 */
function readPackages(fp) {
	if (!fp) {
		return {}
	}

	return utils.read(fp).then(function (pkg) {
		return JSON.parse(pkg)
	})
}

/**
 * Attempt to dynamically `require()` a file or package
 * @param  {String} name 	The dep-name or filepath to require.
 */
function req(name) {
	try {
		return require(name)
	} catch (e) {
		utils.alert(e.message)
	}
}

/**
 * Parse `package.json` for a list of Fly-related plugins,
 *
 * @param {Object}    pkg         The `package.json` contents
 * @param {Array}     blacklist   The plugins to NOT load
 * @return {Array}                Flattened (single) array of plugins
 */
function parse(pkg, blacklist) {
	var esnext = 'fly-esnext'

	_('parse fly-* plugins from `package.json`')

	if (!pkg) {
		return []
	}

	blacklist = (blacklist || []).concat(esnext)

	// all declared dependencies
	var all = ['dependencies', 'devDependencies', 'peerDependencies']
		.filter(function (key) {
			return key in pkg
		}).map(function (dep) {
			return Object.keys(pkg[dep])
		})

	// check if `fly-esnext` is included
	if (flatten(all).indexOf(esnext) !== -1) {
		require(esnext)
	}

	return flatten(all).filter(function (dep) {
		// filter down to `fly-` related deps only & ensure NOT in `blacklist`
		return /^fly-[-\w]+/g.test(dep) && blacklist.indexOf(dep) === -1
	})
}

module.exports = {
	load: load,
	parse: parse,
	findPkg: findPkg,
	readPackages: readPackages
}
