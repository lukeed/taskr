var parse = require('parsec')

module.exports = function () {
	return parse(
		['f', 'file', {default: '.'}],
		'list',
		'help',
		'version',
		['_', 'tasks'], // @todo Catch all tasks, only reads first
		function (key) {
			throw new Error({code: 'UNKNOWN_OPTION', key: key})
		}
	)
}
