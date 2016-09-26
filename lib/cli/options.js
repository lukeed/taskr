var parse = require('minimist')
var errors = require('../utils/errors')

/**
 * Check if string has special symbols
 * @param {string} str
 * @returns {boolean}
 */
function hasSpecialSymbols(str) {
	return /[0-9-[\]{}()*+?.,\\^$|#\s]/.test(str)
}

/**
 * Check if key is valid
 * @param {string} key
 * @returns {boolean}
 */
function validKey(key) {
	return !hasSpecialSymbols(key) && key.length > 1
}

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
			if (key[0] === '-') {
				if (validKey(key.slice(1))) {
					var unknownOptError = new errors.UnknownOptionError()
					unknownOptError.key = key
					throw unknownOptError
				} else {
					throw new errors.InvalidKeyError()
				}
			}
		}
	})
}
