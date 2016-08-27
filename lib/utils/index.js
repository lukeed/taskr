'use strict';

const logging = require('./logging');

const $ = Object.assign(logging, {
	defer: require('./defer'),
	find: require('./find'),
	read: require('./read'),
	write: require('./write'),
	arrayToMap: require('./array-to-map'),
	shallowCopy: require('./shallow-copy'),
	diff: require('./diff'),

	isEmptyObj: obj => {
		for (let x in obj) return false;
		return true;
	},

	isArray: val => Array.isArray(val),

	isObject: val => val != null && typeof val === 'object' && $.isArray(val) === false
});

module.exports = $;
