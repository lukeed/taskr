'use strict';

const $ = exports;

$.isArray = val => Array.isArray(val);

// @see http://stackoverflow.com/a/16608074
$.isObject = val => Boolean(val) && (val.constructor === Object);

$.isEmptyObj = val => $.isObject(val) && !Object.keys(val).length;

$.toArray = val => (val === null || val === undefined) ? [] : $.isArray(val) ? val : [val];

/**
 * Format a task's duration.
 * @param  {Number} num  Total time, in ms
 * @return {String}
 */
$.formatTime = num => {
	let unit = 'ms';
	if (num >= 1000) {
		unit = 's';
		num = Math.round((num / 1000) * 10) / 10;
	}
	return `${num}${unit}`;
};

/**
 * Get the current time!
 * @return {String}  Formatted as `HH:MM:ss`.
 */
$.getTime = () => new Date().toTimeString('UTC').match(/[^\s]+/)[0];

/**
 * Check if value is unique within the group. Modify if is not.
 * @param  {String} val  The value to check.
 * @param  {Array}  arr  The array of values to check against.
 * @return {String}      The unique value; possibly incremented.
 */
$.valUniq = (val, arr) => {
	let n = 0;
	let v = val;
	while (arr.indexOf(v) !== -1) {
		n++;
		v = val.concat(n);
	}
	return v;
};
