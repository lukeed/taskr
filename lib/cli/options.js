var parse = require('minimist')
var errors = require('../utils/errors')

/**
 * Check if string has special symbols
 * @param {string} str
 * @returns {boolean}
 */
function hasSpecialSymbols(str) {
	return /[0-9[\]{}()*+?.,\\^$|#\s]/.test(str)
}

/**
 * Check if key is valid
 * @param {string} key
 * @returns {boolean}
 */
function validKey(key) {
	return (
		key[0] === '-' &&
		key.length > 1 &&
		!hasSpecialSymbols(key)
	)
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
			if (validKey(key)) {
				var unknownOptError = new errors.UnknownOptionError()
				unknownOptError.key = key
				throw unknownOptError
			} else {
				// if key is something weird like -{}& ,
				// we should properly handle it
				throw new errors.InvalidKeyError()
			}
		}
	})
}
