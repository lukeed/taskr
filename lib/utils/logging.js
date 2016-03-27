'use strict'

var pretty = require('prettyjson')
var debug = require('debug')
var clor = require('clor')
var _ = debug('fly:log')

/**
 * Apply args to the `console[method]` & Add a date stamp.
 * Bind `this` to an object with the following options:
 *
 * @param  {String} args.date     The color string to use for the date
 * @param  {String} args.method   The `console` method to use
 * @param  {String} args.custom   The custom styling to append to args
 */
function stamp() {
	var args = [].slice.call(arguments)

	if (process.env.DEBUG) {
		return _.apply(_, args)
	}

	// print the curr time.
	process.stdout.write('[' + clor[this.color](timestamp()) + '] ')

	// apply arguments to `console` method
	console[this.method].apply(console, (this.custom ? [this.custom].concat(args) : args))
}

/**
 * Quickly format the current timestamp
 * @return {String}    as `HH:MM:ss`
 */
function timestamp() {
	var now = new Date()
	return [
		now.getHours(),
		now.getMinutes(),
		now.getSeconds()
	].join(':')
}

/**
 * Logging Utilities
 */

function log() {
	stamp.apply({method: 'log', color: 'magenta'}, arguments)
	return this
}

function error() {
	stamp.apply({method: 'error', color: 'red'}, arguments)
	return this
}

function alert() {
	if (process.env.VERBOSE) {
		stamp.apply({
			custom: clor.yellow.bold('%s'),
			method: 'log',
			color: 'yellow'
		}, arguments)
	}
	return this
}

/**
 * PrettyJSON wrapper & stack tracer
 * @param  {Object} e   The Error object
 */
function trace(e) {
	var msg = pretty.render(e)
		.replace(/(\sFunction|\sObject)\./g, clor.blue('$1') + '.')
		.replace(/\((~?\/.*)\)/g, '(' + clor.gray('$1') + ')')
		.replace(/:([0-9]*):([0-9]*)/g, ' ' + clor.yellow('$1') + ':' + clor.yellow('$2'))
		.replace(new RegExp(process.env.HOME, 'g'), '~')
	console.error(msg)
}

module.exports = {
	alert: alert,
	error: error,
	log: log,
	stamp: stamp,
	trace: trace
}
