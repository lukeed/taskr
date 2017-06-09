"use strict"

const E = require("events")
const test = require("tape")

const reporter = require("../lib/reporter")

class Emit extends E {
	constructor(t) {
		super()
		this.ok = t.ok
	}

	on(e) {
		this.ok(true, `listens to the "${e}" event`)
		return this
	}
}

test("fly.reporter", t => {
	const all = [
		"fake_event",
		"fly_run",
		"taskfile_not_found",
		"fly_watch",
		"fly_watch_event",
		"globs_no_match",
		"plugin_load",
		"plugin_load_error",
		"plugin_error",
		"plugin_warning",
		"plugin_rename",
		"tasks_force_object",
		"task_error",
		"task_start",
		"task_complete",
		"task_not_found",
		"serial_error"
	]

	t.plan(all.length + 1)

	const ctx = new Emit(t)
	const rep = reporter.call(ctx)

	t.deepEqual(rep, ctx, "returns the bound object")

	all.forEach(e => ctx.emit(e))

	t.ok(true, "the `fake_event` was ignored")
})
