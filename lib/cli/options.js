var parse = require('minimist')

module.exports = function () {
	return parse(process.argv.slice(2), {
		default: {
			file: '.'
		},
		alias: {
			v: 'version',
			h: 'help',
			l: 'list',
			f: 'file',
			_: 'tasks'
		},
		unknown: function (key) {
			if (key.slice(0, 1) === '-') {
				throw new Error({code: 'UNKNOWN_OPTION', key: key})
			}
		}
	})
}
