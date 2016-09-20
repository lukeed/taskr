module.exports = arrayToMap

/**
 * Create Map object from single list
 *
 * @param  {Array} list
 * @return {Object}
 */
function arrayToMap(list) {
	var map = {}
	for (var i = 0; i < list.length; i++) {
		map[list[i]] = list[i]
	}
	return map
}
