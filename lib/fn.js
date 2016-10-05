'use strict';

const $ = {
	isArray: val => Array.isArray(val),

	// @see http://stackoverflow.com/a/16608074
	isObject: val => Boolean(val) && (val.constructor === Object),

	isEmptyObj: val => $.isObject(val) && !Object.keys(val).length,

	/**
	 * Format a task's duration.
	 * @param  {Number} num  Total time, in ms
	 * @return {String}
	 */
	formatTime: num => {
		let unit = 'ms';
		if (num >= 1000) {
			unit = 's';
			num = Math.round((num / 1000) * 10) / 10;
		}
		return `${num}${unit}`;
	},

	/**
	 * Get the current time!
	 * @return {String}  Formatted as `HH:MM:ss`.
	 */
	getTime: () => new Date().toTimeString('UTC').match(/[^\s]+/)[0],

	/**
	 * Get a unique key for the object if original was taken.
	 * @param  {String} key  The name to check.
	 * @param  {Object} obj  The object to check against.
	 * @return {String}      The unique key name; possibly incremented.
	 */
	keyUnique: (key, obj) => {
		let n = 0;
		let k = key;
		while (k in obj) {
			n++;
			k = key.concat(n);
		}
		return k;
	}
};

module.exports = $;
