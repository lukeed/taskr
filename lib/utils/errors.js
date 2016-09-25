var util = require('util')
var arrayToMap = require('./array-to-map')

/**
 * Available types of errors
 */
var errorTypes = arrayToMap(['UnknownOption', 'InvalidKey'])

/**
 * Custom message for unknown cli option
 * @constructor UknownOptionError
 * @param {String} message? error message
 */
function UnknownOptionError(message) {
	this.type = errorTypes.UnknownOption
	this.message = message
}

// inherits builtin Error
util.inherits(UnknownOptionError, Error)

/**
 * Custom error for invalid cli option
 * @constructor InvalidKeyError
 * @param {String} message?
 */
function InvalidKeyError(message) {
	this.type = errorTypes.InvalidKey
	this.message = message
}

util.inherits(InvalidKeyError, Error)

module.exports = {
	errorTypes: errorTypes,
	InvalidKeyError: InvalidKeyError,
	UnknownOptionError: UnknownOptionError
}

