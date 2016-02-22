'use strict';

var path = require('path');
var Fly = require('../fly');
var utils = require('../utils');
// import { join, dirname } from "path"
// import { find, filter, bind, alert } from "../utils"

/**
 * Create a new Fly instance
 * @param {String} filepath 		 The path to a Flyfile
 * @param {Function} hook        The method to attach flyfile to instance
 * @return {Fly} 								 The new Fly instance
 */
module.exports = function * (filepath, hook) {
	hook = hook || utils.bind;

	var file = yield utils.find(filepath, hook);

	return new Fly({
		file: file,
		host: require(file),
		plugins: getPlugins(path.dirname(file), hook)
	});
};

/**
 * Load and Return collection of plugins from `base` + /node_modules.
 * Bind require to compile plugins on the fly.
 *
 * @param  {String} base 		The base directory to look for node_modules
 * @param  {Function} hook 	The function to bind plugins to main Fly instance
 * @return {Object}      		The
 */
function getPlugins(base, hook) {
	hook = hook || utils.bind;

	// hook(null, {presets: ['es2015', 'stage-0'], only: [/fly-[-\w]+\/[-\w]+\./, /[fF]lyfile\.js/] })

	return utils.filter(load(path.join(base, 'package')), function (name) {
		return {
			name: name,
			plugin: load(path.join(base, 'node_modules', name))
		};
	});
}

function load(file) {
	try {
		return require(file);
	} catch (e) {
		utils.alert(e.message);
	}
}
