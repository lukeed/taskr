'use strict';

const parse = require('mri')

/**
 * Generic Error class for CLI errors
 */
class UnknownError extends Error {
	constructor(msg) {
		super()
		this.type = 'cli'
		this.message = msg
	}
}

/**
 * Make sense of an input string.
 * @param  {Array}  arr  Input argument segments
 * @return {Object}
 */
module.exports = function (arr) {
	return parse(arr || process.argv.slice(2), {
		default: {
			cwd: '.',
			mode: 'serial'
		},
		alias: {
			v: 'version',
			m: 'mode',
			h: 'help',
			l: 'list',
			d: 'cwd',
			_: 'tasks'
		},
		unknown: key => {
			throw new UnknownError(`Unknown option: \`${key}\`. Run \`taskr -h\` to see available options.`);
		}
	});
}
