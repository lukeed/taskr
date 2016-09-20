'use strict';

const arrayToMap = require('../-funcs').arrayToMap;

/**
 * Available types of errors
 */
const types = arrayToMap(['UnknownOption', 'InvalidKey']);

/**
 * Unknown CLI option.
 * @param {String} msg  Custom error message.
 */
class UnknownOptionError extends Error {
	constructor(msg) {
		this.type = types.UnknownOption;
		this.message = msg;
	}
}

/**
 * Custom error for invalid CLI option
 * @param {String} msg
 */
class InvalidKeyError extends Error {
	constructor(msg) {
		this.type = types.InvalidKey;
		this.message = msg;
	}
}

module.exports = {
	errorTypes: types,
	InvalidKeyError: InvalidKeyError,
	UnknownOptionError: UnknownOptionError
};
