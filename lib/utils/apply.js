module.exports = applyChanges

/**
 * Get error message for diff type
 *
 * @param  {String} prop     properpty name
 * @param  {String} action   difference type
 */
function getMessage(prop, action) {
	return 'sealed property `' + prop + '` could not be ' + action
}

/**
 * Apply differences added to
 * plugin context object
 *
 * @param {Array} changes  list of differences
 * @param {Object} sealedProps
 * @param {Object} inst  Fly instance where changes should be added
 * @return {Null}
 */
function applyChanges(changes, sealedProps, inst) {
	var handlers = {
		// handler for created type
		created: function (change) {
			inst[change.name] = change.value
		},
		// handler for removed type
		removed: function (change, sealed) {
			if (sealed) {
				throw new Error(getMessage(change.name, change.type))
			}

			delete inst[change.name]
		},
		// handler for changed type
		changed: function (change, sealed) {
			if (sealed) {
				throw new Error(getMessage(change.name, change.type))
			}

			inst[change.name] = change.value
		}
	}

	changes.forEach(function (change) {
		handlers[change.type](change, sealedProps[change.name])
	})
}
