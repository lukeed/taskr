"use strict"

const parse = require("minimist")

/**
 * Check if string has special symbols
 * @param {string} str
 * @return {boolean}
 */
const hasSymbols = str => /[0-9-[\]{}()*+?.,\\^$|#\s]/.test(str)

/**
 * Check if key is valid
 * @param {string} key
 * @returns {boolean}
 */
const isValidKey = key => !hasSymbols(key) && key.length > 1

/**
 * Generic Error class for CLI errors
 */
class UnknownError extends Error {
	constructor(msg) {
		super()
		this.type = "cli"
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
			cwd: ".",
			mode: "serial"
		},
		alias: {
			v: "version",
			m: "mode",
			h: "help",
			l: "list",
			d: "cwd",
			_: "tasks"
		},
		unknown: key => {
			if (key[0] !== "-") {
				return
			}

			key = key.slice(1)
			const msg = `${isValidKey(key) ? "Unknown" : "Invalid"} option: \`${key}\`. Run \`fly -h\` to see available options.`
			throw new UnknownError(msg)
		}
	})
}
