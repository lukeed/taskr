/**
 * CLI Formatting shorthand notations
 */

var clor = require('clor')
var assign = require('object-assign')

module.exports = assign(clor, {
	complete: clor.blue.bold('%s'),
	start: clor.bold.yellow('%s'),
	title: clor.bold.yellow('%s'),
	error: clor.bold.red('%s'),
	path: clor.underline.cyan('%s'),
	warn: clor.bold.magenta('%s'),
	secs: clor.green('%d %s')
})
