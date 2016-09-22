'use strict';

const parse = require('minimist');
// @todo Not sure if `errors` necessary
const errors = require('../utils/errors');

/**
 * Check if string has special symbols
 * @param {string} str
 * @return {boolean}
 */
const hasSymbols = str => /[0-9-[\]{}()*+?.,\\^$|#\s]/.test(str);

/**
 * Check if key is valid
 * @param {string} key
 * @returns {boolean}
 */
const isValidKey = key => !hasSymbols(key) && key.length > 1;

module.exports = function () {
	return parse(process.argv.slice(2), {
		default: {
			pwd: '.',
		},
		alias: {
			v: 'version',
			h: 'help',
			l: 'list',
			p: 'pwd',
			_: 'tasks'
		},
		unknown: function (key) {
			if (key[0] === '-') {
				if (!isValidKey(key.slice(1))) {
					throw new errors.InvalidKeyError();
				}
				const err = new errors.UnknownOptionError();
				err.key = key;
				throw err;
			}
		}
	})
}
