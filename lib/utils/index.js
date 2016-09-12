'use strict';

const logging = require('./logging');

const $ = Object.assign(logging, {
	defer: require('./defer'),
	find: require('./find'),
	read: require('./read'),
	write: require('./write')
});

module.exports = $;
