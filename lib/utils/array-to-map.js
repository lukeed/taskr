module.exports = arrayToMap

/**
 * Create Map object from single list
 *
 * @param  {Array} list
 * @return {Object}
 */
function arrayToMap(list) {
	var map = {}
	list.forEach(function (el) {
		map[el] = el
	})
	return map
}
