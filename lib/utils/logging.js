'use strict';

var datefmt = require('dateformat');
var pretty = require('prettyjson');
var arrify = require('arrify');
var debug = require('debug');
var clor = require('clor');
var _ = debug('fly:log');

/**
 * Apply args to the `console[method]` & Add a date stamp.
 * Bind `this` to an object with the following options:
 *
 * @param  {String} args.date 		The color string to use for the date
 * @param  {String} args.method 	The `console` method to use
 * @param  {String} args.custom 	The custom styling to append to args
 */
function stamp(args) {
	args = arrify(args);

	if (process.env.DEBUG) {
		_.apply(_, args);
	} else {
		// print the curr time.
		var time = clor[this.color](datefmt(new Date(), 'HH:MM:ss'));
		process.stdout.write('[' + time + ']');

		// custom opts ?
		var opts = this.custom ? [this.custom].concat(args) : args;
		console[this.method].apply(console, opts);
	}
}

/**
 * Logging Utilities
 */

function log(args) {
	stamp.apply({method: 'log', color: 'magenta'}, arrify(args));
	return this;
}

function error(args) {
	stamp.apply({method: 'error', color: 'red'}, arrify(args));
	return this;
}

function alert(args) {
	if (process.env.VERBOSE) {
		stamp.apply({
			custom: clor.yellow.bold('%s'),
			method: 'log',
			color: 'yellow'
		}, arrify(args));
	}
	return this;
}

/**
 * PrettyJSON wrapper & stack tracer
 * @param  {Object} e The Error object
 */
function trace(e) {
	var msg = pretty.render(e)
		.replace(/(\sFunction|\sObject)\./g, clor.blue('$1') + '.')
		.replace(/\((~?\/.*)\)/g, '(' + clor.gray('$1') + ')')
		.replace(/:([0-9]*):([0-9]*)/g, ' ' + clor.yellow('$1') + ':' + clor.yellow('$2'))
		.replace(new RegExp(process.env.HOME, 'g'), '~');
	console.error(msg);
}

module.exports = {
	alert: alert,
	error: error,
	log: log,
	stamp: stamp,
	trace: trace
};
