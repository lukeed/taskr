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
