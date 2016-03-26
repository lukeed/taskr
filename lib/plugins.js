'use strict'

var path = require('path')
var debug = require('debug')
var utils = require('./utils')
var flatten = require('flatten')
var _ = debug('fly:plugins')

/**
 * Takes a `flyfile` then reads & load fly-related plugins.
 *
 * @param  {String} flyfile 	The main `flyfile.js` path
 * @param  {Function} hook 		The function to bind plugins to main Fly instance
 * @return {Array}      			Array of existent & loaded plugins
 */
function load(flyfile, hook) {
	hook = hook || utils.bind
	// hook(null, {presets: ['es2015', 'stage-0'], only: [/fly-[-\w]+\/[-\w]+\./, /[fF]lyfile\.js/] })

	_('beginning to look for plugins')

	// `flyfile` should also be in project's root
	var dir = path.dirname(flyfile)
	var modules = path.join(dir, 'node_modules')

	// find `package.json` then parse & all fly plugins
	return readPackages(dir).then(function (pkg) {
		return parse(pkg).map(function (name) {
			return {
				name: name,
				plugin: req(path.join(modules, name))
			}
		})
	})
}

/**
 * Find a sibling `package.json` file & return its contents.
 * @param  {String} dir 	The directory to start looking
 * @return {Object}     	The file's contents, or {}
 */
function readPackages(dir) {
	return utils.find('package.json', dir).then(function (fp) {
		if (!fp) {
			return {}
		}

		return utils.read(fp).then(function (pkg) {
			return JSON.parse(pkg)
		})
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
 * @param {Object} 		pkg 				The `package.json` contents
 * @param {Array} 		blacklist 	The plugins to NOT load
 * @return {Array}  							Flattened (single) array of plugins
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
	if (all.indexOf(esnext)) {
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
	readPackages: readPackages
}
