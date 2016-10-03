'use strict';

const $ = {
	isEmptyObj: obj => {
		/* eslint curly:0,no-unused-vars:0,guard-for-in:0 */
		for (const x in obj) return false;
		return true;
	},

	isArray: val => Array.isArray(val),

	isObject: val => {
		return val !== null && typeof val === 'object' && $.isArray(val) === false;
	},

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
