"use strict"

module.exports = function (fly, utils) {
	const self = this
	fly.plugin("localPlugin", {every: 0}, function * (_, { t }) {
		t.true("root" in fly && "emit" in fly && "tasks" in fly, "plugin creator receives `fly` instance")
		t.true("expand" in utils && "find" in utils && "write" in utils, "plugin creator receives `utils` helpers object")
		t.deepEqual(fly, self, "plugin creator context bound to `fly` instance")
	})
}
