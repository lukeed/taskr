"use strict"

/**
 * @todo
 * 		- use "fmt" object definitions
 * 		- use es2015
 */

const clor = require("clor")
const homedir = require("os").homedir
const getTime = require("../fn").getTime

/**
 * Apply args to the `console[method]` & Add a date stamp.
 * Bind `this` to an object with the following options:
 *
 * @param  {String} args.date     The color string to use for the date
 * @param  {String} args.method   The `console` method to use
 * @param  {String} args.custom   The custom styling to append to args
 */
function stamp() {
	let i = 0
	const args = new Array(arguments.length)
	// i is always valid index
	for (; i < args.length; ++i) {
		args[i] = arguments[i]
	}

	// if (process.env.DEBUG) {
	// 	return _.apply(_, args)
	// }

	// print the curr time.
	process.stdout.write(clor[this.color](getTime()) + " ")

	// apply arguments to `console` method
	console[this.method].apply(console, (this.custom ? [this.custom].concat(args) : args))
}

/**
 * Logging Utilities
 */

function log() {
	stamp.apply({method: "log", color: "magenta"}, arguments)
	return this
}

function error() {
	stamp.apply({method: "error", color: "red"}, arguments)
	return this
}

function alert() {
	if (process.env.VERBOSE) {
		stamp.apply({
			custom: clor.yellow.bold("%s"),
			color: "yellow",
			method: "log"
		}, arguments)
	}
	return this
}

module.exports = {alert, error, log}
