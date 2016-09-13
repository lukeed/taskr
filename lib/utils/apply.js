module.exports = applyChanges

/**
 * Get error message for diff type
 *
 * @param  {String} prop     properpty name
 * @param  {String} action   difference type
 */
function getMessage(prop, action) {
	return 'sealed property `' + prop + '` could not be ' + action.toLowerCase()
}

/**
 * Apply differences added to
 * plugin context object
 *
 * @param {Array} changes list of differences
 * @return {Null}
 */
function applyChanges(changes, sealedProps, root) {
	var handlers = {
		// handler for created type
		CREATED: function (change) {
			root[change.name] = change.value
		},
		// handler for removed type
		REMOVED: function (change, sealed) {
			if (sealed) {
				throw new Error(getMessage(change.name, change.type))
			}

			delete root[change.name]
		},
		// handler for changed type
		CHANGED: function (change, sealed) {
			if (sealed) {
				throw new Error(getMessage(change.name, change.type))
			}

			root[change.name] = change.value
		}
	}

	changes.forEach(function (change) {
		handlers[change.type](change, sealedProps[change.name])
	})
}
