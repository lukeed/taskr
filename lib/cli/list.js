var fmt = require('../fmt')
var assign = require('object-assign')

/**
 * List available tasks within a Fly instance
 * @param  {Object} host            The given Fly instance
 * @param  {Boolean} options.bare   Unstyled output
 */
module.exports = function (host, options) {
	options = assign({bare: false}, options || {})
	host = (typeof host === 'function') ? assign(host, {default: host}) : host

	if (!options.bare) {
		console.log('\n' + fmt.dim.bold('Available tasks'))
	}

	each(host, function (task, desc) {
		console.log((options.bare ? '%s' : ' ') + fmt.title + '\t' + desc, task)
	})

	if (!options.bare) {
		console.log()
	}
}

/**
 * Run a handler for each task + its description
 * @param  {Fly} host
 * @param  {Function} handler
 * @return {String}
 */
function each(host, handler) {
	var rgx = /@desc(.*)/
	Object.keys(host).forEach(function (taskname) {
		var arr = rgx.exec(host[taskname].toString())
		var desc = arr ? arr.pop().replace(/\*\//, '') : ''
		handler(taskname, desc)
	})
}
