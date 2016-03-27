var js = require('interpret').jsVariants
var arrify = require('arrify')
var debug = require('debug')
var _ = debug('fly:bind')

/**
 * Register & Bind modules (with options) on the fly
 * @param  {String} filepath The path to a Flyfile
 * @param  {Object} options  The module's options to pass, eg: Babel presets
 * @return {Strubg}          The original file's path
 */
module.exports = function (filepath, options) {
	filepath = filepath || ''

	// the extns to read / pick up. currently: '.js' only
	var ext = filepath.split('.').slice(1).join('.')

	// load/require the necessary modules, as determined by 'interpret'
	var module = reduce(js['.' + ext])
	if (typeof module === 'function') {
		module(options) // pass in module options
	}

	return filepath
}

/**
 * Try requiring each module until we don't error.
 * @param  {String} m   The module's name
 */
function reduce(m) {
	m = arrify(m)

	try {
		var module = m[0].module ? m[0].module : m[0]
		_('register bind %o', module)
		return require(module)
	} catch (_) {
		return m.length ? reduce(m.slice(1)) : null
	}
}
