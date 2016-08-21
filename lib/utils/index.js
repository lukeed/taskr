const logging = require('./logging');

module.exports = Object.assign(logging, {
	defer: require('./defer'),
	find: require('./find'),
	read: require('./read'),
	write: require('./write'),
	arrayToMap: require('./array-to-map'),
	shallowCopy: require('./shallow-copy'),
	diff: require('./diff')
});
