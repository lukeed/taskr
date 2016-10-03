'use strict';

const parse = require('minimist');

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

/**
 * Generic Error class for CLI errors
 */
class UnknownError extends Error {
	constructor(msg) {
		super();
		this.type = 'cli';
		this.message = msg;
	}
}

module.exports = function () {
	return parse(process.argv.slice(2), {
		default: {
			pwd: '.',
			mode: 'serial'
		},
		alias: {
			v: 'version',
			m: 'mode',
			h: 'help',
			l: 'list',
			p: 'pwd',
			_: 'tasks'
		},
		unknown: key => {
			if (key[0] !== '-') {
				return;
			}

			key = key.slice(1);
			let msg = `${isValidKey(key) ? 'Unknown' : 'Invalid'} option: \`${key}\`.`;
			msg += '\n\t\t\tRun `fly -h` to see available options.';

			throw new UnknownError(msg);
		}
	});
};
