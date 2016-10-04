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
	 * Create a Map from a simple Array
	 * @param  {Array} list
	 * @return {Map}
	 */
	arrayToMap: list => {
		const map = {};
		for (const el of list) {
			map[el] = el;
		}
		return map;
	},

	shallowCopy: (merge, value) => {
		/* use object.assign */

		// var copy = merge || {}
		// Object.keys(value).forEach(function (key) {
		// 	copy[key] = value[key]
		// })

		// return copy
	}

	// diff: require('./diff')
};

module.exports = $;
