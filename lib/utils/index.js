'use strict';

const logging = require('./logging');

module.exports = Object.assign(logging, {
	find: require('./find'),
	read: require('./read'),
	write: require('./write'),
	expand: require('globby')
});
