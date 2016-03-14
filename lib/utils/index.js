var assign = require('object-assign')
var logging = require('./logging')

module.exports = assign(logging, {
	bind: require('./bind'),
	defer: require('./defer'),
	find: require('./find'),
	read: require('./read'),
	write: require('./write')
})
