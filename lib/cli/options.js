var parse = require('parsec');

module.exports = function () {
	return parse(
		['f', 'file', {default: '.'}],
		'list',
		'help',
		'version',
		['_', 'tasks'],
		function (key) {
			throw new Error({code: 'UNKNOWN_OPTION', key: key});
		}
	);
};
