"use strict"

module.exports = function (task, utils) {
	const self = this
	task.plugin("localPlugin", {every: 0}, function * (_, opts) {
		const t = opts.t
		t.true("root" in task && "emit" in task && "tasks" in task, "plugin creator receives `Taskr` instance")
		t.true("expand" in utils && "find" in utils && "write" in utils, "plugin creator receives `utils` helpers object")
		t.deepEqual(task, self, "plugin creator context bound to `task` instance")
	})
}
